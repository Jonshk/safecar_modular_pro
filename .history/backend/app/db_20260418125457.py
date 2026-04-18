import sqlite3, os, secrets, string

DB_PATH = os.getenv("DB_PATH", "safecar.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def generate_reference():
    chars = string.ascii_uppercase + string.digits
    return "SC-" + "".join(secrets.choice(chars) for _ in range(4)) + "-" + "".join(secrets.choice(chars) for _ in range(4))

def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS quote_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, phone TEXT NOT NULL, vehicle TEXT NOT NULL,
        issue TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, description TEXT DEFAULT '',
        category TEXT NOT NULL, brand TEXT DEFAULT '',
        sku TEXT DEFAULT '', price REAL NOT NULL, stock INTEGER DEFAULT 0,
        image_url TEXT DEFAULT '', compatible_vehicles TEXT DEFAULT '',
        is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL, customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL, shipping_address TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'card',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        total REAL NOT NULL DEFAULT 0,
        stripe_payment_intent TEXT DEFAULT '',
        confirmation_note TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        part_id INTEGER NOT NULL REFERENCES parts(id),
        part_name TEXT NOT NULL, quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL, subtotal REAL NOT NULL
    )""")

    # ── Training modules ──────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS training_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        title_es TEXT NOT NULL DEFAULT '',
        description TEXT DEFAULT '',
        description_es TEXT DEFAULT '',
        duration_weeks INTEGER DEFAULT 4,
        price REAL NOT NULL DEFAULT 0,
        mode TEXT DEFAULT 'hybrid',
        max_students INTEGER DEFAULT 20,
        schedule TEXT DEFAULT '',
        image_url TEXT DEFAULT '',
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    )""")

    # ── Enrollments ───────────────────────────────────────
    c.execute("""CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        module_id INTEGER NOT NULL REFERENCES training_modules(id),
        module_title TEXT NOT NULL DEFAULT '',
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        student_phone TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'card',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        amount REAL NOT NULL DEFAULT 0,
        stripe_payment_intent TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    )""")

    # Seed sample modules if empty
    count = c.execute("SELECT COUNT(*) FROM training_modules").fetchone()[0]
    if count == 0:
        modules = [
            ("Automotive Electronics Fundamentals", "Fundamentos de Electrónica Automotriz",
             "Circuits, sensors, actuators and how modern vehicles communicate. Learn to read wiring diagrams and trace faults from root cause.",
             "Circuitos, sensores, actuadores y redes de comunicación del vehículo.",
             4, 299.00, "hybrid", 16, "Saturdays 9AM–1PM", "", 1, 1),
            ("Diagnostics Workflow & Fault Isolation", "Flujo de Diagnóstico y Aislamiento de Fallas",
             "Systematic scan tool usage, live data analysis and freeze frames. Stop guessing — start diagnosing.",
             "Uso sistemático del escáner, análisis de datos en vivo y cuadros de congelamiento.",
             6, 399.00, "hybrid", 14, "Saturdays & Sundays 9AM–12PM", "", 1, 2),
            ("Motorcycle Mechanics", "Mecánica de Motocicletas",
             "Engine teardown, suspension tuning, electrical and fuel systems for two-wheel vehicles.",
             "Desmontaje de motor, suspensión, eléctrico y combustible para motos.",
             3, 249.00, "presential", 12, "Fridays 4PM–8PM", "", 1, 3),
            ("Hands-On Shop Learning Blocks", "Bloques de Aprendizaje en Taller Real",
             "Work live jobs alongside certified technicians. Real vehicles, real tools, real feedback.",
             "Trabaja en vehículos reales junto a técnicos certificados.",
             0, 199.00, "presential", 8, "Open schedule — book a slot", "", 1, 4),
        ]
        c.executemany("""
            INSERT INTO training_modules
              (title, title_es, description, description_es, duration_weeks,
               price, mode, max_students, schedule, image_url, is_active, sort_order)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, modules)

    conn.commit()
    conn.close()