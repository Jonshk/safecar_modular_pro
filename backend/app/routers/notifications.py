"""
Router de notificaciones push (Firebase Cloud Messaging).

SETUP:
1. Crea un proyecto en Firebase Console → Project Settings → Service Accounts
2. Genera la "Firebase Admin SDK private key" → descarga el JSON
3. Pon el contenido del JSON en la variable de entorno: FIREBASE_SERVICE_ACCOUNT_JSON
   (una sola línea, el JSON completo en string)
4. En Render: Settings → Environment → Add env var

Dependencia extra a añadir a requirements.txt:
    firebase-admin==6.5.0
"""

import os
import json
import logging
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.db import get_connection

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["notifications"])

# ── Firebase init (lazy, solo si hay credenciales) ────────

_firebase_app = None

def _get_firebase():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    raw = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    if not raw:
        logger.warning("FIREBASE_SERVICE_ACCOUNT_JSON no configurado — push desactivado")
        return None

    try:
        import firebase_admin
        from firebase_admin import credentials
        cred_dict = json.loads(raw)
        cred = credentials.Certificate(cred_dict)
        _firebase_app = firebase_admin.initialize_app(cred)
        return _firebase_app
    except Exception as e:
        logger.error(f"Error inicializando Firebase: {e}")
        return None

# ── Schemas ───────────────────────────────────────────────

class RegisterTokenIn(BaseModel):
    token: str
    device_label: Optional[str] = "Admin Device"

class TokenOut(BaseModel):
    id: int
    token: str
    device_label: str
    is_active: int
    created_at: str

class PushTestIn(BaseModel):
    title: str
    body: str

# ── Endpoints de tokens ───────────────────────────────────

@router.post("/register-token", response_model=TokenOut, status_code=201)
def register_token(data: RegisterTokenIn):
    """
    El APK admin llama esto al arrancar para registrar/actualizar su FCM token.
    Si el token ya existe, lo reactiva.
    """
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO fcm_tokens (token, device_label, is_active)
        VALUES (%s, %s, 1)
        ON CONFLICT (token)
        DO UPDATE SET
            device_label = EXCLUDED.device_label,
            is_active = 1,
            updated_at = to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
        RETURNING *
    """, (data.token, data.device_label))
    row = dict(c.fetchone())
    conn.commit()
    c.close(); conn.close()
    return row

@router.delete("/unregister-token/{token}")
def unregister_token(token: str):
    """El APK admin llama esto al cerrar sesión."""
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "UPDATE fcm_tokens SET is_active=0 WHERE token=%s",
        (token,)
    )
    conn.commit()
    c.close(); conn.close()
    return {"unregistered": True}

@router.get("/tokens", response_model=List[TokenOut])
def list_tokens():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM fcm_tokens WHERE is_active=1 ORDER BY created_at DESC")
    rows = [dict(r) for r in c.fetchall()]
    c.close(); conn.close()
    return rows

@router.post("/test-push")
def test_push(data: PushTestIn):
    """Endpoint para probar que las notificaciones llegan al APK admin."""
    sent = send_push_to_all_admins(
        event_type="test",
        reference_id=0,
        reference_code="TEST",
        title=data.title,
        body=data.body
    )
    return {"tokens_attempted": sent["tokens_sent"], "success": sent["success"]}

@router.get("/log")
def get_notification_log(skip: int = 0, limit: int = 50):
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM notification_log ORDER BY created_at DESC LIMIT %s OFFSET %s",
        (limit, skip)
    )
    rows = [dict(r) for r in c.fetchall()]
    c.close(); conn.close()
    return rows

# ── Funciones internas usadas por otros routers ───────────

def send_push_to_all_admins(
    event_type: str,
    reference_id: int,
    reference_code: str,
    title: str,
    body: str
) -> dict:
    """
    Envía notificación push a todos los dispositivos ADMIN activos
    (tabla fcm_tokens). Usado cuando el CLIENTE crea una solicitud
    nueva y hay que avisarle al taller.
    Retorna dict con tokens_sent y success count.
    Falla silenciosamente si Firebase no está configurado.
    """
    app = _get_firebase()

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT token FROM fcm_tokens WHERE is_active=1")
    tokens = [r["token"] for r in c.fetchall()]

    tokens_sent = len(tokens)
    success_count = 0

    if not tokens:
        _log_notification(c, conn, event_type, reference_id, reference_code, title, body, 0, 0)
        c.close(); conn.close()
        return {"tokens_sent": 0, "success": 0}

    if app is None:
        logger.warning(f"Push omitido (Firebase sin configurar): {title}")
        _log_notification(c, conn, event_type, reference_id, reference_code, title, body, tokens_sent, 0)
        c.close(); conn.close()
        return {"tokens_sent": tokens_sent, "success": 0}

    try:
        from firebase_admin import messaging

        messages = [
            messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                data={
                    "event_type": event_type,
                    "reference_id": str(reference_id),
                    "reference_code": reference_code,
                },
                android=messaging.AndroidConfig(
                    priority="high",
                    notification=messaging.AndroidNotification(
                        icon="ic_notification",
                        color="#D4AF37",   # dorado Safe Car Admin
                        sound="default",
                        channel_id="safecar_admin_channel",
                    ),
                ),
                token=t,
            )
            for t in tokens
        ]

        batch_response = messaging.send_each(messages)
        success_count = batch_response.success_count

        for idx, resp in enumerate(batch_response.responses):
            if not resp.success:
                err_code = str(resp.exception)
                if "registration-token-not-registered" in err_code or "invalid-registration-token" in err_code:
                    c.execute(
                        "UPDATE fcm_tokens SET is_active=0 WHERE token=%s",
                        (tokens[idx],)
                    )
                    logger.info(f"Token desactivado (inválido): {tokens[idx][:20]}...")

        conn.commit()

    except Exception as e:
        logger.error(f"Error enviando push: {e}")

    _log_notification(c, conn, event_type, reference_id, reference_code, title, body, tokens_sent, success_count)
    c.close(); conn.close()
    return {"tokens_sent": tokens_sent, "success": success_count}


def send_push_to_token(
    token: str,
    event_type: str,
    title: str,
    body: str,
    reference: str = "",
) -> dict:
    """
    Envía notificación push a UN solo token específico — usado para
    notificar al CLIENTE (no al admin) cuando cambia el estado de su
    grúa/reserva/pedido. A diferencia de send_push_to_all_admins, este
    token no vive en la tabla fcm_tokens (esa es solo para admins),
    sino en la columna fcm_token de la fila del propio tow_request /
    booking / order.
    """
    if not token:
        return {"success": False, "reason": "no_token"}

    app = _get_firebase()
    if app is None:
        logger.warning(f"Push a cliente omitido (Firebase sin configurar): {title}")
        return {"success": False, "reason": "firebase_not_configured"}

    conn = get_connection()
    c = conn.cursor()
    success = False
    try:
        from firebase_admin import messaging

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={"event_type": event_type, "reference_code": reference},
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    icon="ic_notification",
                    color="#E8323C",   # rojo de marca Safe Car (cliente)
                    sound="default",
                    channel_id="safecar_client_channel",
                ),
            ),
            token=token,
        )
        messaging.send(message)
        success = True
    except Exception as e:
        logger.error(f"Error enviando push a cliente: {e}")

    _log_notification(c, conn, event_type, 0, "", title, body, 1, 1 if success else 0)
    c.close(); conn.close()
    return {"success": success}


def _log_notification(c, conn, event_type, reference_id, reference_code, title, body, tokens_sent, success):
    try:
        c.execute("""
            INSERT INTO notification_log
              (event_type, reference_id, reference_code, title, body, tokens_sent, success)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (event_type, reference_id, reference_code, title, body, tokens_sent, success))
        conn.commit()
    except Exception as e:
        logger.error(f"Error guardando log de notificación: {e}")