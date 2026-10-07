"""Run only against the explicitly supplied disposable test database."""
import os
import uuid
import psycopg2
import pytest
from psycopg2 import sql
from psycopg2.extras import RealDictCursor
from app import db


def test_fresh_schema_and_repeat_startup_preserve_data(monkeypatch):
    dsn = os.getenv('SAFECAR_TEST_DATABASE_URL')
    if not dsn:
        pytest.skip('Disposable PostgreSQL test database not supplied')
    schema = 'test_' + uuid.uuid4().hex
    admin = psycopg2.connect(dsn)
    admin.autocommit = True
    with admin.cursor() as cursor:
        cursor.execute(sql.SQL('CREATE SCHEMA {}').format(sql.Identifier(schema)))
    def connection():
        return psycopg2.connect(dsn, cursor_factory=RealDictCursor,
                               options='-c search_path=' + schema)
    monkeypatch.setattr(db, 'get_connection', connection)
    try:
        db.init_db()
        with connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("INSERT INTO tow_requests (reference, customer_name, customer_phone, vehicle_description, pickup_address) VALUES ('TEST-1','Test','Test','Test','Test') RETURNING id")
                tow_id = cursor.fetchone()['id']
                cursor.execute("INSERT INTO reviews (customer_name,rating,comment) VALUES ('Test',5,'A test review')")
                cursor.execute("INSERT INTO tow_messages (tow_id,sender,text) VALUES (%s,'client','Test message')", (tow_id,))
        db.init_db()
        with connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT * FROM tow_requests WHERE id=%s', (tow_id,))
                row = cursor.fetchone()
                assert row['reference'] == 'TEST-1'
                assert row['fcm_token'] == ''
                assert row['technician_lat'] == 0
                assert row['technician_lng'] == 0
                assert row['technician_updated_at'] == ''
                cursor.execute('SELECT COUNT(*) AS n FROM reviews')
                assert cursor.fetchone()['n'] == 1
                cursor.execute('SELECT COUNT(*) AS n FROM tow_messages')
                assert cursor.fetchone()['n'] == 1
    finally:
        with admin.cursor() as cursor:
            cursor.execute(sql.SQL('DROP SCHEMA {} CASCADE').format(sql.Identifier(schema)))
        admin.close()

