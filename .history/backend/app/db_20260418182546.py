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

    c.execute("""CREATE TABLE IF NOT EXISTS training_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL, title_es TEXT NOT NULL DEFAULT '',
        description TEXT DEFAULT '', description_es TEXT DEFAULT '',
        duration_weeks INTEGER DEFAULT 4, price REAL NOT NULL DEFAULT 0,
        mode TEXT DEFAULT 'hybrid', max_students INTEGER DEFAULT 20,
        schedule TEXT DEFAULT '', image_url TEXT DEFAULT '',
        is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        module_id INTEGER NOT NULL REFERENCES training_modules(id),
        module_title TEXT NOT NULL DEFAULT '',
        student_name TEXT NOT NULL, student_email TEXT NOT NULL,
        student_phone TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'card',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        amount REAL NOT NULL DEFAULT 0,
        stripe_payment_intent TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    )""")

    # ── Seed parts ────────────────────────────────────────
    parts_count = c.execute("SELECT COUNT(*) FROM parts").fetchone()[0]
    if parts_count == 0:
        parts = [
            # BRAKES
            (
                "Front Brake Pad Set", "Semi-metallic front brake pads for excellent stopping power and heat dissipation. OEM-spec fitment.",
                "Brakes", "Bosch",  "BPF-4421", 48.99,  24,
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=90&auto=format&fit=crop",
                "Toyota Camry 2018-2023, Honda Accord 2017-2022"
            ),
            (
                "Rear Brake Pad Set", "Ceramic rear brake pads — low dust, quiet operation, great fade resistance.",
                "Brakes", "Brembo", "BPR-8812", 54.99, 18,
                "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=90&auto=format&fit=crop",
                "Ford F-150 2015-2023, Chevrolet Silverado 2014-2023"
            ),
            (
                "Brake Rotor — Front Pair", "Slotted & cross-drilled rotors for improved heat dissipation. Fits most mid-size sedans.",
                "Brakes", "EBC",    "RTR-2290", 124.99, 10,
                "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=90&auto=format&fit=crop",
                "Honda Civic 2016-2023, Toyota Corolla 2019-2023"
            ),
            (
                "Brake Caliper — Front Left", "Remanufactured front left caliper. Pressure tested. Direct bolt-on replacement.",
                "Brakes", "Cardone","CLF-1830", 89.99,  8,
                "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=90&auto=format&fit=crop",
                "Chevrolet Malibu 2016-2022, Buick LaCrosse 2017-2019"
            ),
            # ELECTRICAL
            (
                "Car Battery 12V 600CCA", "Maintenance-free AGM battery. 600 cold cranking amps for reliable starts in any weather.",
                "Electrical", "Optima", "BAT-6006", 189.99, 12,
                "https://images.unsplash.com/photo-1609924211018-5526c55bad5b?w=800&q=90&auto=format&fit=crop",
                "Universal fit — Group 35 / most domestic & Asian vehicles"
            ),
            (
                "Alternator 160A", "High-output remanufactured alternator. 160A output. Includes new brushes and voltage regulator.",
                "Electrical", "Denso", "ALT-1602", 159.99, 7,
                "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=90&auto=format&fit=crop",
                "Honda CR-V 2017-2022, Honda Pilot 2016-2022"
            ),
            (
                "Starter Motor", "OEM-equivalent starter motor. Pre-engaged, 1.4kW. Direct replacement — no wiring modifications needed.",
                "Electrical", "Bosch", "STR-4410", 129.99, 9,
                "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=90&auto=format&fit=crop",
                "Toyota Tacoma 2016-2023, Toyota 4Runner 2014-2023"
            ),
            (
                "MAF Sensor", "Mass Air Flow sensor. OEM-quality, pre-calibrated. Resolves P0100-P0104 fault codes.",
                "Electrical", "Delphi", "MAF-0821", 79.99, 15,
                "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=90&auto=format&fit=crop",
                "Ford Mustang 2015-2023, Ford F-150 EcoBoost 2015-2023"
            ),
            (
                "O2 Sensor — Upstream", "Wideband upstream oxygen sensor. Improves fuel economy and resolves P0130-P0138 codes.",
                "Electrical", "Bosch",  "O2U-3301", 44.99,  20,
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=90&auto=format&fit=crop",
                "Honda Civic 2012-2021, Honda CR-V 2012-2021"
            ),
            # ENGINE
            (
                "Engine Oil Filter", "High-capacity spin-on oil filter. Anti-drain back valve. Fits most GM, Ford and Chrysler engines.",
                "Engine", "Fram", "OFE-3600", 9.99, 60,
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=90&auto=format&fit=crop",
                "GM V8 5.3L / 6.2L, Ford 5.0L Coyote, Dodge 5.7L Hemi"
            ),
            (
                "Spark Plug Set (4)", "Iridium tip spark plugs. 100,000-mile service life. Improves fuel efficiency and cold starts.",
                "Engine", "NGK",   "SPK-7090", 34.99,  30,
                "https://images.unsplash.com/photo-1589750602846-60028879da30?w=800&q=90&auto=format&fit=crop",
                "Toyota Camry 2.5L 2018-2023, RAV4 2019-2023"
            ),
            (
                "Timing Belt Kit", "Complete timing belt kit: belt, tensioner, idler pulley and water pump. OEM-spec materials.",
                "Engine", "Gates",  "TBK-2250", 149.99, 6,
                "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=90&auto=format&fit=crop",
                "Honda Accord 2.4L 2008-2017, Honda CR-V 2.4L 2007-2016"
            ),
            (
                "Valve Cover Gasket", "Silicone valve cover gasket set. Stops oil leaks at cam cover. Includes all hardware.",
                "Engine", "Fel-Pro","VCG-7712", 29.99,  22,
                "https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=800&q=90&auto=format&fit=crop",
                "Toyota 2GR-FE 3.5L V6 — Camry, Avalon, Sienna 2007-2018"
            ),
            (
                "Thermostat + Housing", "OEM thermostat (88°C) with housing and seal. Prevents overheating and heater problems.",
                "Engine", "Stant",  "TST-1188", 39.99,  17,
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=90&auto=format&fit=crop",
                "Chevrolet Cruze 1.4T 2011-2019, Buick Encore 2013-2019"
            ),
            # SUSPENSION
            (
                "Front Strut Assembly", "Complete front strut assembly with spring and mount. No spring compression needed — bolt-on.",
                "Suspension", "Monroe", "STR-9021", 119.99, 8,
                "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=90&auto=format&fit=crop",
                "Toyota Corolla 2009-2019, Matrix 2009-2014"
            ),
            (
                "Rear Shock Absorber Pair", "Gas-charged rear shocks. OEM ride quality. Comes as a pair for balanced handling.",
                "Suspension", "KYB",    "SHK-3445", 94.99,  11,
                "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=800&q=90&auto=format&fit=crop",
                "Honda Accord 2013-2017, Acura TLX 2015-2020"
            ),
            (
                "Control Arm — Front Lower", "Forged steel lower control arm with ball joint pre-installed. Corrects pull and tire wear.",
                "Suspension", "Moog",   "CAL-8814", 109.99, 6,
                "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&q=90&auto=format&fit=crop",
                "Ford Explorer 2011-2019, Edge 2011-2014"
            ),
            (
                "Wheel Hub & Bearing Assembly", "Pre-packed sealed hub bearing assembly. Resolves wobble, grinding noise and ABS faults.",
                "Suspension", "Timken","WHB-5530", 84.99, 13,
                "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=90&auto=format&fit=crop",
                "GM Impala 2006-2016, Buick LaCrosse 2010-2016"
            ),
            # FILTERS
            (
                "Air Filter — Engine", "High-flow cotton gauze air filter. Washable & reusable. +5% airflow over OEM paper filter.",
                "Filters", "K&N",   "AF-3399",  29.99, 35,
                "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=90&auto=format&fit=crop",
                "Universal — multiple fitments available"
            ),
            (
                "Cabin Air Filter", "Activated carbon cabin filter. Blocks pollen, dust and odors. Easy under-dash replacement.",
                "Filters", "Bosch",  "CAF-5571", 19.99, 45,
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=90&auto=format&fit=crop",
                "Toyota Camry 2012-2023, Avalon 2013-2022"
            ),
            (
                "Fuel Filter", "High-pressure inline fuel filter. 150-micron filtration. Protects injectors from debris.",
                "Filters", "Wix",   "FF-2280",  24.99, 20,
                "https://images.unsplash.com/photo-1623796851310-462fcf61e956?w=800&q=90&auto=format&fit=crop",
                "Honda Accord 2003-2012, Pilot 2003-2015"
            ),
            # COOLING
            (
                "Radiator", "OEM-spec aluminum core radiator. Full plastic tanks. Pressure tested to 20 PSI.",
                "Cooling", "Spectra","RAD-1440", 189.99, 5,
                "https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=800&q=90&auto=format&fit=crop",
                "Dodge Charger / Challenger 3.6L V6 2011-2023"
            ),
            (
                "Water Pump", "Cast iron impeller water pump. Includes gasket. Resolves overheating and coolant loss.",
                "Cooling", "Airtex","WP-8814",  64.99, 14,
                "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=90&auto=format&fit=crop",
                "GM 3.6L V6 — Equinox, Traverse, Malibu 2010-2017"
            ),
        ]

        c.executemany("""
            INSERT INTO parts
              (name, description, category, brand, sku, price, stock,
               image_url, compatible_vehicles, is_active)
            VALUES (?,?,?,?,?,?,?,?,?,1)
        """, parts)

    # ── Seed training modules ─────────────────────────────
    modules_count = c.execute("SELECT COUNT(*) FROM training_modules").fetchone()[0]
    if modules_count == 0:
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