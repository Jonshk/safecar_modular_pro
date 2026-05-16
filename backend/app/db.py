import os, secrets, string
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def generate_reference():
    chars = string.ascii_uppercase + string.digits
    return "SC-" + "".join(secrets.choice(chars) for _ in range(4)) + "-" + "".join(secrets.choice(chars) for _ in range(4))

def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL, phone TEXT NOT NULL, vehicle TEXT NOT NULL,
        issue TEXT NOT NULL, created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS parts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL, description TEXT DEFAULT '',
        category TEXT NOT NULL, brand TEXT DEFAULT '',
        sku TEXT DEFAULT '', price REAL NOT NULL, stock INTEGER DEFAULT 0,
        image_url TEXT DEFAULT '', compatible_vehicles TEXT DEFAULT '',
        is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL, customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL, shipping_address TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'card',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        total REAL NOT NULL DEFAULT 0,
        stripe_payment_intent TEXT DEFAULT '',
        confirmation_note TEXT DEFAULT '',
        created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        part_id INTEGER NOT NULL REFERENCES parts(id),
        part_name TEXT NOT NULL, quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL, subtotal REAL NOT NULL
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS training_modules (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL, title_es TEXT NOT NULL DEFAULT '',
        description TEXT DEFAULT '', description_es TEXT DEFAULT '',
        duration_weeks INTEGER DEFAULT 4, price REAL NOT NULL DEFAULT 0,
        mode TEXT DEFAULT 'hybrid', max_students INTEGER DEFAULT 20,
        schedule TEXT DEFAULT '', image_url TEXT DEFAULT '',
        is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE,
        module_id INTEGER NOT NULL REFERENCES training_modules(id),
        module_title TEXT NOT NULL DEFAULT '',
        student_name TEXT NOT NULL, student_email TEXT NOT NULL,
        student_phone TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'card',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        amount REAL NOT NULL DEFAULT 0,
        stripe_payment_intent TEXT DEFAULT '',
        created_at TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
    )""")

    # ── Seed parts ─────────────────────────────────────────
    c.execute("SELECT COUNT(*) as cnt FROM parts")
    parts_count = c.fetchone()["cnt"]
    if parts_count == 0:
        parts = [
            ("Front Brake Pad Set","Semi-metallic front brake pads for excellent stopping power and heat dissipation. OEM-spec fitment.","Brakes","Bosch","BPF-4421",48.99,24,"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&q=85&auto=format&fit=crop","Toyota Camry 2018-2023, Honda Accord 2017-2022"),
            ("Rear Brake Pad Set","Ceramic rear brake pads — low dust, quiet operation, great fade resistance.","Brakes","Brembo","BPR-8812",54.99,18,"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=85&auto=format&fit=crop","Ford F-150 2015-2023, Chevrolet Silverado 2014-2023"),
            ("Brake Rotor — Front Pair","Slotted & cross-drilled rotors for improved heat dissipation.","Brakes","EBC","RTR-2290",124.99,10,"https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=900&q=85&auto=format&fit=crop","Honda Civic 2016-2023, Toyota Corolla 2019-2023"),
            ("Brake Caliper — Front Left","Remanufactured front left caliper. Pressure tested. Direct bolt-on replacement.","Brakes","Cardone","CLF-1830",89.99,8,"https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=900&q=85&auto=format&fit=crop","Chevrolet Malibu 2016-2022, Buick LaCrosse 2017-2019"),
            ("Car Battery 12V 600CCA","Maintenance-free AGM battery. 600 cold cranking amps.","Electrical","Optima","BAT-6006",189.99,12,"https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=900&q=85&auto=format&fit=crop","Universal fit — Group 35"),
            ("Alternator 160A","High-output remanufactured alternator. 160A output.","Electrical","Denso","ALT-1602",159.99,7,"https://images.unsplash.com/photo-1612825173281-9a193378527e?w=900&q=85&auto=format&fit=crop","Honda CR-V 2017-2022, Honda Pilot 2016-2022"),
            ("Starter Motor","OEM-equivalent starter motor. Pre-engaged, 1.4kW.","Electrical","Bosch","STR-4410",129.99,9,"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=85&auto=format&fit=crop","Toyota Tacoma 2016-2023, Toyota 4Runner 2014-2023"),
            ("MAF Sensor","Mass Air Flow sensor. OEM-quality, pre-calibrated.","Electrical","Delphi","MAF-0821",79.99,15,"https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=900&q=85&auto=format&fit=crop","Ford Mustang 2015-2023, Ford F-150 EcoBoost 2015-2023"),
            ("O2 Sensor — Upstream","Wideband upstream oxygen sensor. Improves fuel economy.","Electrical","Bosch","O2U-3301",44.99,20,"https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=900&q=85&auto=format&fit=crop","Honda Civic 2012-2021, Honda CR-V 2012-2021"),
            ("Engine Oil Filter","High-capacity spin-on oil filter. Anti-drain back valve.","Engine","Fram","OFE-3600",9.99,60,"https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=900&q=85&auto=format&fit=crop","GM V8 5.3L / 6.2L, Ford 5.0L Coyote, Dodge 5.7L Hemi"),
            ("Spark Plug Set (4pcs)","Iridium tip spark plugs. 100,000-mile service life.","Engine","NGK","SPK-7090",34.99,30,"https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=900&q=85&auto=format&fit=crop","Toyota Camry 2.5L 2018-2023, RAV4 2019-2023"),
            ("Timing Belt Kit","Complete timing belt kit: belt, tensioner, idler pulley and water pump.","Engine","Gates","TBK-2250",149.99,6,"https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=900&q=85&auto=format&fit=crop","Honda Accord 2.4L 2008-2017, Honda CR-V 2.4L 2007-2016"),
            ("Valve Cover Gasket","Silicone valve cover gasket set. Stops oil leaks at cam cover.","Engine","Fel-Pro","VCG-7712",29.99,22,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&auto=format&fit=crop","Toyota 2GR-FE 3.5L V6 — Camry, Avalon, Sienna 2007-2018"),
            ("Thermostat + Housing","OEM thermostat (88°C) with housing and seal.","Engine","Stant","TST-1188",39.99,17,"https://images.unsplash.com/photo-1563720223185-11003d516935?w=900&q=85&auto=format&fit=crop","Chevrolet Cruze 1.4T 2011-2019, Buick Encore 2013-2019"),
            ("Front Strut Assembly","Complete front strut assembly with spring and mount.","Suspension","Monroe","STR-9021",119.99,8,"https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=900&q=85&auto=format&fit=crop","Toyota Corolla 2009-2019, Matrix 2009-2014"),
            ("Rear Shock Absorber Pair","Gas-charged rear shocks. OEM ride quality. Comes as a pair.","Suspension","KYB","SHK-3445",94.99,11,"https://images.unsplash.com/photo-1609152712027-76a5a7e8ce27?w=900&q=85&auto=format&fit=crop","Honda Accord 2013-2017, Acura TLX 2015-2020"),
            ("Control Arm — Front Lower","Forged steel lower control arm with ball joint pre-installed.","Suspension","Moog","CAL-8814",109.99,6,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&auto=format&fit=crop","Ford Explorer 2011-2019, Edge 2011-2014"),
            ("Wheel Hub & Bearing Assembly","Pre-packed sealed hub bearing. Resolves wobble and grinding noise.","Suspension","Timken","WHB-5530",84.99,13,"https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=900&q=85&auto=format&fit=crop","GM Impala 2006-2016, Buick LaCrosse 2010-2016"),
            ("Air Filter — Engine","High-flow cotton gauze air filter. Washable & reusable.","Filters","K&N","AF-3399",29.99,35,"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&q=85&auto=format&fit=crop","Universal fit"),
            ("Cabin Air Filter","Activated carbon cabin filter. Blocks pollen, dust and odors.","Filters","Bosch","CAF-5571",19.99,45,"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=85&auto=format&fit=crop","Toyota Camry 2012-2023, Avalon 2013-2022"),
            ("Fuel Filter","High-pressure inline fuel filter. 150-micron filtration.","Filters","Wix","FF-2280",24.99,20,"https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=900&q=85&auto=format&fit=crop","Honda Accord 2003-2012, Pilot 2003-2015"),
            ("Radiator","OEM-spec aluminum core radiator. Full plastic tanks.","Cooling","Spectra","RAD-1440",189.99,5,"https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=900&q=85&auto=format&fit=crop","Dodge Charger / Challenger 3.6L V6 2011-2023"),
            ("Water Pump","Cast iron impeller water pump. Includes gasket.","Cooling","Airtex","WP-8814",64.99,14,"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=85&auto=format&fit=crop","GM 3.6L V6 — Equinox, Traverse, Malibu 2010-2017"),
        ]
        c.executemany("""
            INSERT INTO parts (name, description, category, brand, sku, price, stock, image_url, compatible_vehicles, is_active)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,1)
        """, parts)

    # ── Seed training modules ──────────────────────────────
    c.execute("SELECT COUNT(*) as cnt FROM training_modules")
    modules_count = c.fetchone()["cnt"]
    if modules_count == 0:
        modules = [
            ("Automotive Electronics Fundamentals","Fundamentos de Electrónica Automotriz","Circuits, sensors, actuators and how modern vehicles communicate. Learn to read wiring diagrams and trace faults from root cause.","Circuitos, sensores, actuadores y redes de comunicación del vehículo.",4,299.00,"hybrid",16,"Saturdays 9AM–1PM","",1,1),
            ("Diagnostics Workflow & Fault Isolation","Flujo de Diagnóstico y Aislamiento de Fallas","Systematic scan tool usage, live data analysis and freeze frames.","Uso sistemático del escáner, análisis de datos en vivo.",6,399.00,"hybrid",14,"Saturdays & Sundays 9AM–12PM","",1,2),
            ("Motorcycle Mechanics","Mecánica de Motocicletas","Engine teardown, suspension tuning, electrical and fuel systems for two-wheel vehicles.","Desmontaje de motor, suspensión, eléctrico y combustible para motos.",3,249.00,"presential",12,"Fridays 4PM–8PM","",1,3),
            ("Hands-On Shop Learning Blocks","Bloques de Aprendizaje en Taller Real","Work live jobs alongside certified technicians. Real vehicles, real tools, real feedback.","Trabaja en vehículos reales junto a técnicos certificados.",0,199.00,"presential",8,"Open schedule — book a slot","",1,4),
        ]
        c.executemany("""
            INSERT INTO training_modules (title, title_es, description, description_es, duration_weeks, price, mode, max_students, schedule, image_url, is_active, sort_order)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, modules)

    conn.commit()
    c.close()
    conn.close()