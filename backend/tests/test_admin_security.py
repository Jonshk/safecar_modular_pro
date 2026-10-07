import sys
import types
import importlib
from datetime import datetime, timedelta, timezone
import jwt
import pytest
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer
from fastapi.testclient import TestClient

# Isolated authentication settings; no production credential is read.
auth = types.ModuleType('app.routers.auth')
auth.ADMIN_USER = 'test-admin'
bearer = HTTPBearer()
def verify_token(credentials=Depends(bearer)):
    try:
        return jwt.decode(credentials.credentials, 'local-test-key', algorithms=['HS256'])['sub']
    except jwt.PyJWTError:
        raise HTTPException(401, 'Invalid token')
auth.verify_token = verify_token
sys.modules['app.routers.auth'] = auth

from app.admin_security import secure_admin_routes, require_admin

MODULES = ['quote_requests', 'parts', 'orders', 'training', 'upload',
           'tow_requests', 'service_bookings', 'notifications', 'reviews', 'chat']
app = FastAPI()
for name in MODULES:
    router = importlib.import_module('app.routers.' + name).router
    app.include_router(secure_admin_routes(router))
client = TestClient(app)

protected = [(method, route.path) for route in app.routes
             if hasattr(route, 'dependant') and any(d.call is require_admin for d in route.dependant.dependencies)
             for method in route.methods]

def concrete(path):
    import re
    return re.sub(r'\{[^}]+\}', '1', path)

@pytest.mark.parametrize('method,path', protected)
def test_admin_routes_reject_anonymous_before_database_or_body(method, path):
    response = client.request(method, concrete(path), json={})
    assert response.status_code in (401, 403)

@pytest.mark.parametrize('method,path', protected)
def test_admin_routes_reject_invalid_token(method, path):
    response = client.request(method, concrete(path), headers={'Authorization': 'Bearer invalid'}, json={})
    assert response.status_code == 401

@pytest.mark.parametrize('method,path', protected)
def test_admin_routes_reject_other_subject(method, path):
    token = jwt.encode({'sub': 'other-user', 'exp': datetime.now(timezone.utc) + timedelta(minutes=1)},
                       'local-test-key', algorithm='HS256')
    assert client.request(method, concrete(path), headers={'Authorization': 'Bearer ' + token}, json={}).status_code == 403

def test_valid_admin_reaches_handler():
    isolated = FastAPI()
    @isolated.get('/protected', dependencies=[Depends(require_admin)])
    def endpoint():
        return {'ok': True}
    token = jwt.encode({'sub': 'test-admin', 'exp': datetime.now(timezone.utc) + timedelta(minutes=1)},
                       'local-test-key', algorithm='HS256')
    assert TestClient(isolated).get('/protected', headers={'Authorization': 'Bearer ' + token}).status_code == 200

def test_customer_and_webhook_routes_remain_public():
    public = {('POST', '/tow/'), ('POST', '/bookings/'), ('GET', '/tow/track/{reference}'),
              ('GET', '/training/modules'), ('GET', '/reviews/'), ('POST', '/reviews/'),
              ('POST', '/orders/webhook'), ('POST', '/training/webhook')}
    assert not public.intersection(protected)

def test_migration_endpoint_is_not_registered():
    import ast
    from pathlib import Path
    tree = ast.parse(Path('app/main.py').read_text())
    assert not any(isinstance(n, ast.ImportFrom) and n.module == 'app.routers.admin_migrate'
                   for n in ast.walk(tree))

def test_schema_sql_is_valid_postgresql():
    from pglast import parse_sql
    from app.schema_migrations import SCHEMA_COMPLETION_SQL
    assert len(parse_sql(SCHEMA_COMPLETION_SQL)) == 6
