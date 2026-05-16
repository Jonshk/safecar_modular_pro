import os, secrets, string

DATABASE_URL = os.getenv("DATABASE_URL", "")
USE_POSTGRES = DATABASE_URL.startswith("postgresql") or DATABASE_URL.startswith("postgres")

if USE_POSTGRES:
    import psycopg2
    from psycopg2.extras import RealDictCursor

    def get_connection():
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

else:
    import sqlite3

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

    if USE_POSTGRES:
        c = conn.cursor()

        c.execute("""CREATE TABLE IF NOT EXISTS quote_requests (
            id SERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL,
            vehicle TEXT NOT NULL, issue TEXT NOT NULL,
            created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS parts (
            id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '',
            category TEXT NOT NULL, brand TEXT DEFAULT '', sku TEXT DEFAULT '',
            price REAL NOT NULL, stock INTEGER DEFAULT 0, image_url TEXT DEFAULT '',
            compatible_vehicles TEXT DEFAULT '', is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY, reference TEXT NOT NULL UNIQUE,
            customer_name TEXT NOT NULL, customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL, shipping_address TEXT NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'card',
            payment_status TEXT NOT NULL DEFAULT 'pending',
            total REAL NOT NULL DEFAULT 0, stripe_payment_intent TEXT DEFAULT '',
            confirmation_note TEXT DEFAULT '',
            created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            part_id INTEGER NOT NULL REFERENCES parts(id), part_name TEXT NOT NULL,
            quantity INTEGER NOT NULL, unit_price REAL NOT NULL, subtotal REAL NOT NULL
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS training_modules (
            id SERIAL PRIMARY KEY, title TEXT NOT NULL, title_es TEXT NOT NULL DEFAULT '',
            description TEXT DEFAULT '', description_es TEXT DEFAULT '',
            duration_weeks INTEGER DEFAULT 4, price REAL NOT NULL DEFAULT 0,
            mode TEXT DEFAULT 'hybrid', max_students INTEGER DEFAULT 20,
            schedule TEXT DEFAULT '', image_url TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS enrollments (
            id SERIAL PRIMARY KEY, reference TEXT NOT NULL UNIQUE,
            module_id INTEGER NOT NULL REFERENCES training_modules(id),
            module_title TEXT NOT NULL DEFAULT '', student_name TEXT NOT NULL,
            student_email TEXT NOT NULL, student_phone TEXT NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'card',
            payment_status TEXT NOT NULL DEFAULT 'pending',
            amount REAL NOT NULL DEFAULT 0, stripe_payment_intent TEXT DEFAULT '',
            created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")
        # ── REVIEWS ──────────────────────────────────────────────
        c.execute("""CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            customer_name VARCHAR(100) NOT NULL,
            customer_email VARCHAR(200),
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            service_type VARCHAR(50),
            is_approved BOOLEAN DEFAULT FALSE,
            created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
        )""")

        # Seed parts
        c.execute("SELECT COUNT(*) as cnt FROM parts")
        if c.fetchone()["cnt"] == 0:
            _seed_parts_pg(c)

        # Seed modules
        c.execute("SELECT COUNT(*) as cnt FROM training_modules")
        if c.fetchone()["cnt"] == 0:
            _seed_modules_pg(c)

        conn.commit()
        c.close()

    else:
        c = conn.cursor()
        c.execute("""CREATE TABLE IF NOT EXISTS quote_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL,
            vehicle TEXT NOT NULL, issue TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS parts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT DEFAULT '',
            category TEXT NOT NULL, brand TEXT DEFAULT '', sku TEXT DEFAULT '',
            price REAL NOT NULL, stock INTEGER DEFAULT 0, image_url TEXT DEFAULT '',
            compatible_vehicles TEXT DEFAULT '', is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT NOT NULL UNIQUE,
            customer_name TEXT NOT NULL, customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL, shipping_address TEXT NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'card',
            payment_status TEXT NOT NULL DEFAULT 'pending',
            total REAL NOT NULL DEFAULT 0, stripe_payment_intent TEXT DEFAULT '',
            confirmation_note TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            part_id INTEGER NOT NULL REFERENCES parts(id), part_name TEXT NOT NULL,
            quantity INTEGER NOT NULL, unit_price REAL NOT NULL, subtotal REAL NOT NULL
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS training_modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
            title_es TEXT NOT NULL DEFAULT '', description TEXT DEFAULT '',
            description_es TEXT DEFAULT '', duration_weeks INTEGER DEFAULT 4,
            price REAL NOT NULL DEFAULT 0, mode TEXT DEFAULT 'hybrid',
            max_students INTEGER DEFAULT 20, schedule TEXT DEFAULT '',
            image_url TEXT DEFAULT '', is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT NOT NULL UNIQUE,
            module_id INTEGER NOT NULL REFERENCES training_modules(id),
            module_title TEXT NOT NULL DEFAULT '', student_name TEXT NOT NULL,
            student_email TEXT NOT NULL, student_phone TEXT NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'card',
            payment_status TEXT NOT NULL DEFAULT 'pending',
            amount REAL NOT NULL DEFAULT 0, stripe_payment_intent TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        )""")
        # ── REVIEWS ──────────────────────────────────────────────
        c.execute("""CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name VARCHAR(100) NOT NULL,
            customer_email VARCHAR(200),
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT NOT NULL,
            service_type VARCHAR(50),
            is_approved INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )""")

        if c.execute("SELECT COUNT(*) FROM parts").fetchone()[0] == 0:
            _seed_parts_sqlite(c)
        if c.execute("SELECT COUNT(*) FROM training_modules").fetchone()[0] == 0:
            _seed_modules_sqlite(c)

        conn.commit()

    conn.close()


# ── Seed data ──────────────────────────────────────────────
PARTS_DATA = [
    ("Front Brake Pad Set","Semi-metallic front brake pads for excellent stopping power.","Brakes","Bosch","BPF-4421",48.99,24,"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&q=85&auto=format&fit=crop","Toyota Camry 2018-2023, Honda Accord 2017-2022"),
    ("Rear Brake Pad Set","Ceramic rear brake pads — low dust, quiet operation.","Brakes","Brembo","BPR-8812",54.99,18,"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=85&auto=format&fit=crop","Ford F-150 2015-2023, Chevrolet Silverado 2014-2023"),
    ("Brake Rotor — Front Pair","Slotted & cross-drilled rotors for improved heat dissipation.","Brakes","EBC","RTR-2290",124.99,10,"https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=900&q=85&auto=format&fit=crop","Honda Civic 2016-2023, Toyota Corolla 2019-2023"),
    ("Brake Caliper — Front Left","Remanufactured front left caliper. Pressure tested.","Brakes","Cardone","CLF-1830",89.99,8,"https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=900&q=85&auto=format&fit=crop","Chevrolet Malibu 2016-2022, Buick LaCrosse 2017-2019"),
    ("Car Battery 12V 600CCA","Maintenance-free AGM battery. 600 cold cranking amps.","Electrical","Optima","BAT-6006",189.99,12,"https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=900&q=85&auto=format&fit=crop","Universal fit — Group 35"),
    ("Alternator 160A","High-output remanufactured alternator. 160A output.","Electrical","Denso","ALT-1602",159.99,7,"https://images.unsplash.com/photo-1612825173281-9a193378527e?w=900&q=85&auto=format&fit=crop","Honda CR-V 2017-2022, Honda Pilot 2016-2022"),
    ("Starter Motor","OEM-equivalent starter motor. Pre-engaged, 1.4kW.","Electrical","Bosch","STR-4410",129.99,9,"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=85&auto=format&fit=crop","Toyota Tacoma 2016-2023, Toyota 4Runner 2014-2023"),
    ("MAF Sensor","Mass Air Flow sensor. OEM-quality, pre-calibrated.","Electrical","Delphi","MAF-0821",79.99,15,"https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=900&q=85&auto=format&fit=crop","Ford Mustang 2015-2023, Ford F-150 EcoBoost 2015-2023"),
    ("O2 Sensor — Upstream","Wideband upstream oxygen sensor. Improves fuel economy.","Electrical","Bosch","O2U-3301",44.99,20,"https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=900&q=85&auto=format&fit=crop","Honda Civic 2012-2021, Honda CR-V 2012-2021"),
    ("Engine Oil Filter","High-capacity spin-on oil filter.","Engine","Fram","OFE-3600",9.99,60,"https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=900&q=85&auto=format&fit=crop","GM V8 5.3L / 6.2L, Ford 5.0L Coyote"),
    ("Spark Plug Set (4pcs)","Iridium tip spark plugs. 100,000-mile service life.","Engine","NGK","SPK-7090",34.99,30,"https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=900&q=85&auto=format&fit=crop","Toyota Camry 2.5L 2018-2023, RAV4 2019-2023"),
    ("Timing Belt Kit","Complete timing belt kit with tensioner and water pump.","Engine","Gates","TBK-2250",149.99,6,"https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=900&q=85&auto=format&fit=crop","Honda Accord 2.4L 2008-2017, Honda CR-V 2.4L 2007-2016"),
    ("Valve Cover Gasket","Silicone valve cover gasket set.","Engine","Fel-Pro","VCG-7712",29.99,22,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&auto=format&fit=crop","Toyota 2GR-FE 3.5L V6 2007-2018"),
    ("Thermostat + Housing","OEM thermostat (88°C) with housing and seal.","Engine","Stant","TST-1188",39.99,17,"https://images.unsplash.com/photo-1563720223185-11003d516935?w=900&q=85&auto=format&fit=crop","Chevrolet Cruze 1.4T 2011-2019"),
    ("Front Strut Assembly","Complete front strut assembly with spring and mount.","Suspension","Monroe","STR-9021",119.99,8,"https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=900&q=85&auto=format&fit=crop","Toyota Corolla 2009-2019"),
    ("Rear Shock Absorber Pair","Gas-charged rear shocks. Comes as a pair.","Suspension","KYB","SHK-3445",94.99,11,"https://images.unsplash.com/photo-1609152712027-76a5a7e8ce27?w=900&q=85&auto=format&fit=crop","Honda Accord 2013-2017, Acura TLX 2015-2020"),
    ("Control Arm — Front Lower","Forged steel lower control arm with ball joint.","Suspension","Moog","CAL-8814",109.99,6,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&auto=format&fit=crop","Ford Explorer 2011-2019"),
    ("Wheel Hub & Bearing Assembly","Pre-packed sealed hub bearing.","Suspension","Timken","WHB-5530",84.99,13,"https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=900&q=85&auto=format&fit=crop","GM Impala 2006-2016"),
    ("Air Filter — Engine","High-flow cotton gauze air filter. Washable & reusable.","Filters","K&N","AF-3399",29.99,35,"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&q=85&auto=format&fit=crop","Universal fit"),
    ("Cabin Air Filter","Activated carbon cabin filter.","Filters","Bosch","CAF-5571",19.99,45,"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=85&auto=format&fit=crop","Toyota Camry 2012-2023"),
    ("Fuel Filter","High-pressure inline fuel filter.","Filters","Wix","FF-2280",24.99,20,"https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=900&q=85&auto=format&fit=crop","Honda Accord 2003-2012"),
    ("Radiator","OEM-spec aluminum core radiator.","Cooling","Spectra","RAD-1440",189.99,5,"https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=900&q=85&auto=format&fit=crop","Dodge Charger / Challenger 3.6L V6 2011-2023"),
    ("Water Pump","Cast iron impeller water pump. Includes gasket.","Cooling","Airtex","WP-8814",64.99,14,"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=85&auto=format&fit=crop","GM 3.6L V6 — Equinox, Traverse 2010-2017"),
]

MODULES_DATA = [
    ("Automotive Electronics Fundamentals","Fundamentos de Electrónica Automotriz","Circuits, sensors, actuators and how modern vehicles communicate.","Circuitos, sensores, actuadores y redes de comunicación.",4,299.00,"hybrid",16,"Saturdays 9AM–1PM","",1,1),
    ("Diagnostics Workflow & Fault Isolation","Flujo de Diagnóstico y Aislamiento de Fallas","Systematic scan tool usage, live data analysis and freeze frames.","Uso sistemático del escáner y análisis de datos en vivo.",6,399.00,"hybrid",14,"Saturdays & Sundays 9AM–12PM","",1,2),
    ("Motorcycle Mechanics","Mecánica de Motocicletas","Engine teardown, suspension tuning, electrical and fuel systems.","Desmontaje de motor, suspensión, eléctrico y combustible.",3,249.00,"presential",12,"Fridays 4PM–8PM","",1,3),
    ("Hands-On Shop Learning Blocks","Bloques de Aprendizaje en Taller Real","Work live jobs alongside certified technicians.","Trabaja en vehículos reales junto a técnicos certificados.",0,199.00,"presential",8,"Open schedule","",1,4),
]

def _seed_parts_pg(c):
    c.executemany("""
        INSERT INTO parts (name,description,category,brand,sku,price,stock,image_url,compatible_vehicles,is_active)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,1)
    """, PARTS_DATA)

def _seed_parts_sqlite(c):
    c.executemany("""
        INSERT INTO parts (name,description,category,brand,sku,price,stock,image_url,compatible_vehicles,is_active)
        VALUES (?,?,?,?,?,?,?,?,?,1)
    """, PARTS_DATA)

def _seed_modules_pg(c):
    c.executemany("""
        INSERT INTO training_modules (title,title_es,description,description_es,duration_weeks,price,mode,max_students,schedule,image_url,is_active,sort_order)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, MODULES_DATA)

def _seed_modules_sqlite(c):
    c.executemany("""
        INSERT INTO training_modules (title,title_es,description,description_es,duration_weeks,price,mode,max_students,schedule,image_url,is_active,sort_order)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """, MODULES_DATA)