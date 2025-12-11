#!/usr/bin/env python3
"""
Verify that the Cozy Condo database schema has been set up correctly
"""
import requests
import json

def verify_database_setup():
    """Verify all tables and data are properly set up"""
    supabase_url = "https://pzrdkijtktgdwayjzbfu.supabase.co"
    service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM"

    headers = {
        'Authorization': f'Bearer {service_key}',
        'apikey': service_key,
        'Content-Type': 'application/json'
    }

    print("🔍 Verifying Cozy Condo Database Setup")
    print("=" * 50)

    tables_to_verify = {
        'properties': 'Property listings',
        'property_photos': 'Property photos',
        'calendar_events': 'Calendar events',
        'blog_posts': 'Blog posts',
        'site_settings': 'Site settings'
    }

    all_tables_exist = True
    total_records = 0

    for table, description in tables_to_verify.items():
        try:
            # Check if table exists and get count
            response = requests.get(
                f"{supabase_url}/rest/v1/{table}?select=count",
                headers=headers,
                params={'count': 'exact', 'limit': 0}
            )

            if response.status_code == 200:
                count = response.headers.get('Content-Range', '0').split('/')[1]
                total_records += int(count)
                print(f"✓ {description}: {count} records")
            else:
                print(f"✗ {description}: Table not accessible (Status: {response.status_code})")
                all_tables_exist = False
        except Exception as e:
            print(f"✗ {description}: Error - {e}")
            all_tables_exist = False

    print()

    if all_tables_exist:
        print("🎉 DATABASE VERIFICATION SUCCESSFUL!")
        print("✓ All required tables are accessible")
        print(f"✓ Total records found: {total_records}")

        # Test sample data in properties
        try:
            response = requests.get(
                f"{supabase_url}/rest/v1/properties?select=name,slug,location",
                headers=headers,
                params={'limit': 5}
            )

            if response.status_code == 200:
                properties = response.json()
                if properties:
                    print("\n📝 Sample Properties Found:")
                    for prop in properties:
                        print(f"  • {prop['name']} ({prop['slug']}) - {prop['location']}")
                else:
                    print("ℹ️  No sample properties found (this is okay)")
        except Exception as e:
            print(f"⚠️  Could not fetch sample properties: {e}")

        # Test site settings
        try:
            response = requests.get(
                f"{supabase_url}/rest/v1/site_settings?select=site_name,tagline",
                headers=headers,
                params={'limit': 1}
            )

            if response.status_code == 200:
                settings = response.json()
                if settings:
                    print(f"\n🏠 Site Configuration:")
                    print(f"  • Site Name: {settings[0]['site_name']}")
                    print(f"  • Tagline: {settings[0]['tagline']}")
        except Exception as e:
            print(f"⚠️  Could not fetch site settings: {e}")

        print("\n✅ Your Cozy Condo database is ready to use!")
        return True
    else:
        print("❌ DATABASE VERIFICATION FAILED!")
        print("Some tables are missing or not accessible.")
        print("Please ensure the schema has been properly executed.")
        return False

if __name__ == "__main__":
    verify_database_setup()