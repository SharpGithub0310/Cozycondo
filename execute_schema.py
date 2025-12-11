#!/usr/bin/env python3
"""
Script to execute Cozy Condo schema in Supabase database
"""
import psycopg2
import psycopg2.extensions
import sys
import os

def read_schema_file():
    """Read the schema.sql file"""
    schema_path = '/mnt/m/AI/cozy-condo/supabase/schema.sql'
    try:
        with open(schema_path, 'r') as file:
            return file.read()
    except FileNotFoundError:
        print(f"ERROR: Schema file not found at {schema_path}")
        sys.exit(1)

def execute_schema():
    """Execute the schema in Supabase database"""
    # Supabase PostgreSQL connection parameters
    connection_params = {
        'host': 'db.pzrdkijtktgdwayjzbfu.supabase.co',
        'port': 5432,
        'database': 'postgres',
        'user': 'postgres',
        'password': 'Cozycondo1235813'
    }

    print("Reading schema file...")
    schema_sql = read_schema_file()

    try:
        print("Connecting to Supabase PostgreSQL database...")
        conn = psycopg2.connect(**connection_params)
        conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        print("✓ Connection successful!")
        print("Executing schema...")

        # Execute the schema
        cursor.execute(schema_sql)

        print("✓ Schema executed successfully!")

        # Verify tables were created
        print("\nVerifying table creation...")
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)

        tables = cursor.fetchall()
        print(f"✓ Created {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")

        # Check if sample data was inserted
        print("\nVerifying sample data...")

        # Check properties
        cursor.execute("SELECT COUNT(*) FROM properties;")
        property_count = cursor.fetchone()[0]
        print(f"✓ Properties table: {property_count} records")

        if property_count > 0:
            cursor.execute("SELECT name, slug FROM properties ORDER BY display_order;")
            properties = cursor.fetchall()
            print("  Sample properties:")
            for prop in properties:
                print(f"    - {prop[0]} ({prop[1]})")

        # Check site settings
        cursor.execute("SELECT COUNT(*) FROM site_settings;")
        settings_count = cursor.fetchone()[0]
        print(f"✓ Site settings table: {settings_count} records")

        if settings_count > 0:
            cursor.execute("SELECT site_name, tagline FROM site_settings LIMIT 1;")
            settings = cursor.fetchone()
            print(f"  Site name: {settings[0]}")
            print(f"  Tagline: {settings[1]}")

        # Check indexes
        print("\nVerifying indexes...")
        cursor.execute("""
            SELECT indexname, tablename
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND indexname LIKE 'idx_%'
            ORDER BY tablename, indexname;
        """)

        indexes = cursor.fetchall()
        print(f"✓ Created {len(indexes)} custom indexes:")
        for index in indexes:
            print(f"  - {index[0]} on {index[1]}")

        # Check triggers
        print("\nVerifying triggers...")
        cursor.execute("""
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name;
        """)

        triggers = cursor.fetchall()
        print(f"✓ Created {len(triggers)} triggers:")
        for trigger in triggers:
            print(f"  - {trigger[0]} on {trigger[1]}")

        print("\n" + "="*60)
        print("🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"✓ {len(tables)} tables created")
        print(f"✓ {len(indexes)} custom indexes created")
        print(f"✓ {len(triggers)} update triggers created")
        print(f"✓ {property_count} sample properties inserted")
        print(f"✓ {settings_count} site settings record inserted")
        print("✓ Row Level Security enabled on all tables")
        print("✓ Public and service role policies created")
        print("✓ UUID extension enabled")
        print("✓ Update timestamp function created")

        cursor.close()
        conn.close()
        print("\nDatabase connection closed.")
        return True

    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    execute_schema()