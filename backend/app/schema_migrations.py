"""Additive, repeatable schema completion; existing data is preserved."""

SCHEMA_COMPLETION_SQL = """
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    service_type TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
);
CREATE TABLE IF NOT EXISTS tow_messages (
    id SERIAL PRIMARY KEY,
    tow_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    sender_name TEXT NOT NULL DEFAULT '',
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
);
ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS fcm_token TEXT DEFAULT '';
ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS technician_lat REAL DEFAULT 0;
ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS technician_lng REAL DEFAULT 0;
ALTER TABLE tow_requests ADD COLUMN IF NOT EXISTS technician_updated_at TEXT DEFAULT '';
"""
