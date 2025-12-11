#!/usr/bin/env python3
"""
Script to verify Cozy Condo schema execution in Supabase database
"""
import requests
import json
import sys

def verify_tables():
    """Verify that all tables were created successfully"""
    base_url = "https://pzrdkijtktgdwayjzbfu.supabase.co/rest/v1"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM"
    }

    tables_to_check = [
        "properties",
        "property_photos",
        "calendar_events",
        "blog_posts",
        "site_settings"
    ]

    print("Verifying Cozy Condo schema execution...")
    print("=" * 50)

    all_tables_exist = True

    for table in tables_to_check:
        try:
            response = requests.get(f"{base_url}/{table}?limit=1", headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"✅ Table '{table}' exists and is accessible")
                # Check if it has any data
                data = response.json()
                if data:
                    print(f"   └── Contains {len(data)} record(s)")
                else:
                    print(f"   └── Table is empty (expected for fresh installation)")
            else:
                print(f"❌ Table '{table}' - Error: {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   └── Details: {error_detail.get('message', 'Unknown error')}")
                except:
                    print(f"   └── HTTP Error: {response.text}")
                all_tables_exist = False
        except requests.RequestException as e:
            print(f"❌ Table '{table}' - Connection error: {e}")
            all_tables_exist = False

    print("\n" + "=" * 50)

    if all_tables_exist:
        print("🎉 Schema verification completed successfully!")
        print("All tables are created and accessible.")

        # Check for sample data
        print("\nChecking sample data...")
        try:
            properties_response = requests.get(f"{base_url}/properties", headers=headers, timeout=10)
            if properties_response.status_code == 200:
                properties_data = properties_response.json()
                if properties_data:
                    print(f"✅ Sample properties loaded: {len(properties_data)} properties")
                    for prop in properties_data:
                        print(f"   - {prop.get('name', 'Unnamed')} ({prop.get('slug', 'no-slug')})")
                else:
                    print("ℹ️  No sample properties found (this is normal if you removed sample data)")
        except:
            print("⚠️  Could not check sample data")

        # Check for site settings
        print("\nChecking site settings...")
        try:
            settings_response = requests.get(f"{base_url}/site_settings", headers=headers, timeout=10)
            if settings_response.status_code == 200:
                settings_data = settings_response.json()
                if settings_data:
                    setting = settings_data[0]
                    print(f"✅ Site settings configured: {setting.get('site_name', 'Unknown')}")
                    print(f"   - Tagline: {setting.get('tagline', 'Not set')}")
                    print(f"   - Email: {setting.get('email', 'Not set')}")
                else:
                    print("⚠️  No site settings found")
        except:
            print("⚠️  Could not check site settings")

        return True
    else:
        print("❌ Schema verification failed!")
        print("Some tables are missing or inaccessible.")
        print("\nTo resolve this, please execute the schema manually:")
        print("1. Go to: https://supabase.com/dashboard/project/pzrdkijtktgdwayjzbfu")
        print("2. Navigate to SQL Editor")
        print("3. Copy and paste the contents of /mnt/m/AI/cozy-condo/supabase/schema.sql")
        print("4. Click 'Run' to execute")
        return False

if __name__ == "__main__":
    success = verify_tables()
    sys.exit(0 if success else 1)