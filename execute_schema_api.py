#!/usr/bin/env python3
"""
Execute Cozy Condo schema using Supabase SQL API
"""
import requests
import json
import sys

def read_schema_file():
    """Read the schema.sql file"""
    schema_path = '/mnt/m/AI/cozy-condo/supabase/schema.sql'
    try:
        with open(schema_path, 'r') as file:
            return file.read()
    except FileNotFoundError:
        print(f"ERROR: Schema file not found at {schema_path}")
        sys.exit(1)

def execute_schema_via_api():
    """Execute schema using Supabase SQL API (experimental approach)"""

    # Supabase configuration
    supabase_url = "https://pzrdkijtktgdwayjzbfu.supabase.co"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM"

    print("Reading schema file...")
    schema_sql = read_schema_file()

    # Unfortunately, Supabase doesn't provide a public SQL execution API for DDL
    print("❌ Direct SQL execution via API is not available through public endpoints.")
    print("\nSince direct PostgreSQL connection is not available from this environment,")
    print("you'll need to execute the schema manually in one of these ways:")
    print()
    print("OPTION 1 - Supabase Dashboard (Recommended):")
    print("1. Go to: https://supabase.com/dashboard/project/pzrdkijtktgdwayjzbfu")
    print("2. Navigate to 'SQL Editor' in the sidebar")
    print("3. Copy the entire schema from: /mnt/m/AI/cozy-condo/supabase/schema.sql")
    print("4. Paste it into the SQL Editor")
    print("5. Click 'Run' to execute")
    print()
    print("OPTION 2 - Local psql client:")
    print("If you have PostgreSQL client installed locally, run:")
    print("psql -h db.pzrdkijtktgdwayjzbfu.supabase.co -p 5432 -U postgres -d postgres -f supabase/schema.sql")
    print("Password: Cozycondo1235813")
    print()
    print("OPTION 3 - Copy schema content:")
    print("Here's the schema content to copy:")
    print("-" * 60)
    print(schema_sql)
    print("-" * 60)

    return False

def check_if_tables_exist():
    """Check if tables already exist using REST API"""
    supabase_url = "https://pzrdkijtktgdwayjzbfu.supabase.co"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM"

    headers = {
        'Authorization': f'Bearer {service_key}',
        'apikey': service_key,
        'Content-Type': 'application/json'
    }

    tables_to_check = ['properties', 'property_photos', 'calendar_events', 'blog_posts', 'site_settings']
    existing_tables = []

    print("Checking if database schema has been set up...")

    for table in tables_to_check:
        try:
            response = requests.get(
                f"{supabase_url}/rest/v1/{table}?select=count",
                headers=headers,
                params={'count': 'exact', 'limit': 0}
            )

            if response.status_code == 200:
                # Extract count from response headers
                count = response.headers.get('Content-Range', '0').split('/')[1]
                existing_tables.append((table, count))
                print(f"✓ Table '{table}' exists with {count} records")
            else:
                print(f"✗ Table '{table}' does not exist or is not accessible")
        except Exception as e:
            print(f"✗ Error checking table '{table}': {e}")

    if len(existing_tables) == len(tables_to_check):
        print(f"\n🎉 All {len(existing_tables)} tables exist! Database schema appears to be set up.")

        # Check for sample data in properties table
        for table_name, count in existing_tables:
            if table_name == 'properties' and int(count) > 0:
                print(f"✓ Sample data exists: {count} properties found")
                break

        return True
    else:
        print(f"\n❌ Only {len(existing_tables)} out of {len(tables_to_check)} tables exist.")
        print("The database schema needs to be set up.")
        return False

if __name__ == "__main__":
    print("Cozy Condo Database Schema Setup Tool")
    print("=" * 50)

    # First check if tables already exist
    if check_if_tables_exist():
        print("\n✅ Database schema is already set up and ready to use!")
        sys.exit(0)
    else:
        print("\n⚠️  Database schema needs to be set up.")
        execute_schema_via_api()
        sys.exit(1)