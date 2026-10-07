"""Attach admin authentication before FastAPI copies router routes."""
from fastapi import Depends, HTTPException
from fastapi.routing import APIRoute
from app.routers.auth import ADMIN_USER, verify_token


def require_admin(user: str = Depends(verify_token)) -> str:
    if user != ADMIN_USER:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


ADMIN_ROUTES = {
    ("GET", "/quote-requests"),
    ("GET", "/bookings/"),
    ("GET", "/bookings/{booking_id}"),
    ("PATCH", "/bookings/{booking_id}/status"),
    ("DELETE", "/bookings/{booking_id}"),
    ("GET", "/tow/"),
    ("GET", "/tow/{tow_id}"),
    ("PATCH", "/tow/{tow_id}/status"),
    ("PATCH", "/tow/{tow_id}/location"),
    ("DELETE", "/tow/{tow_id}"),
    ("POST", "/orders/{order_id}/confirm-manual"),
    ("GET", "/orders/admin/all"),
}


def secure_admin_routes(router):
    for route in router.routes:
        if not isinstance(route, APIRoute):
            continue
        protected = (
            "/admin/" in route.path
            or route.path.startswith("/notifications/")
            or route.path.startswith("/upload/")
            or any((method, route.path) in ADMIN_ROUTES for method in route.methods)
        )
        if protected:
            route.dependencies.append(Depends(require_admin))
    return router
