#!/usr/bin/env python3
"""
Supabase Database Verification Script
Verifies that all tables, data, and configurations are set up correctly.
"""

import requests
import json
from typing import Dict, List, Any

# Supabase configuration
SUPABASE_URL = "https://pzrdkijtktgdwayjzbfu.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Mzc5NTcsImV4cCI6MjA4MTAxMzk1N30.rnfsiyAA81gpNBDwQ8fkCaYDOA9eyPPBPPQ5AUQDd8U"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM"

class SupabaseVerifier:
    def __init__(self):
        self.base_url = SUPABASE_URL
        self.headers_anon = {
            "apikey": ANON_KEY,
            "Authorization": f"Bearer {ANON_KEY}",
            "Content-Type": "application/json"
        }
        self.headers_service = {
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        self.verification_results = {}

    def make_request(self, endpoint: str, use_service_role: bool = False) -> Dict[str, Any]:
        """Make a request to Supabase REST API"""
        url = f"{self.base_url}/rest/v1/{endpoint}"
        headers = self.headers_service if use_service_role else self.headers_anon

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return {"success": True, "data": response.json(), "status": response.status_code}
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": str(e), "status": getattr(e.response, 'status_code', None)}

    def verify_table_exists(self, table_name: str) -> bool:
        """Verify if a table exists by attempting to query it"""
        print(f"Checking if table '{table_name}' exists...")
        result = self.make_request(f"{table_name}?limit=1", use_service_role=True)

        if result["success"]:
            print(f"✅ Table '{table_name}' exists")
            return True
        else:
            print(f"❌ Table '{table_name}' does not exist or is not accessible")
            print(f"   Error: {result.get('error')}")
            return False

    def verify_table_structure(self, table_name: str) -> Dict[str, Any]:
        """Verify table structure by querying a single row"""
        print(f"\nChecking structure of table '{table_name}'...")
        result = self.make_request(f"{table_name}?limit=1", use_service_role=True)

        if result["success"]:
            data = result["data"]
            if data:
                columns = list(data[0].keys())
                print(f"✅ Table '{table_name}' has {len(columns)} columns: {columns}")
                return {"exists": True, "columns": columns, "sample_row": data[0]}
            else:
                print(f"✅ Table '{table_name}' exists but is empty")
                return {"exists": True, "columns": [], "sample_row": None}
        else:
            print(f"❌ Could not verify structure of table '{table_name}'")
            return {"exists": False, "error": result.get("error")}

    def verify_sample_data(self):
        """Verify that sample data was inserted correctly"""
        print("\n" + "="*50)
        print("VERIFYING SAMPLE DATA")
        print("="*50)

        # Check properties
        print("\nChecking properties table...")
        result = self.make_request("properties", use_service_role=True)
        if result["success"]:
            properties = result["data"]
            print(f"✅ Found {len(properties)} properties")
            for prop in properties:
                print(f"   - {prop.get('title', 'Unknown')}: ${prop.get('price', 'N/A')}/night")
        else:
            print(f"❌ Could not retrieve properties: {result.get('error')}")

        # Check property photos
        print("\nChecking property_photos table...")
        result = self.make_request("property_photos", use_service_role=True)
        if result["success"]:
            photos = result["data"]
            print(f"✅ Found {len(photos)} property photos")
            for photo in photos[:5]:  # Show first 5
                print(f"   - Photo for property {photo.get('property_id')}: {photo.get('url', 'N/A')}")
        else:
            print(f"❌ Could not retrieve property photos: {result.get('error')}")

        # Check calendar events
        print("\nChecking calendar_events table...")
        result = self.make_request("calendar_events", use_service_role=True)
        if result["success"]:
            events = result["data"]
            print(f"✅ Found {len(events)} calendar events")
        else:
            print(f"❌ Could not retrieve calendar events: {result.get('error')}")

        # Check site settings
        print("\nChecking site_settings table...")
        result = self.make_request("site_settings", use_service_role=True)
        if result["success"]:
            settings = result["data"]
            print(f"✅ Found {len(settings)} site settings")
            for setting in settings:
                print(f"   - {setting.get('key', 'Unknown')}: {setting.get('value', 'N/A')}")
        else:
            print(f"❌ Could not retrieve site settings: {result.get('error')}")

        # Check blog posts
        print("\nChecking blog_posts table...")
        result = self.make_request("blog_posts", use_service_role=True)
        if result["success"]:
            posts = result["data"]
            print(f"✅ Found {len(posts)} blog posts")
        else:
            print(f"❌ Could not retrieve blog posts: {result.get('error')}")

    def verify_rls_policies(self):
        """Test RLS policies by trying to access data with anon key"""
        print("\n" + "="*50)
        print("VERIFYING RLS POLICIES")
        print("="*50)

        tables_to_test = ["properties", "property_photos", "calendar_events", "blog_posts", "site_settings"]

        for table in tables_to_test:
            print(f"\nTesting RLS for '{table}' table...")

            # Test with anon key (should work for read operations on public tables)
            result = self.make_request(f"{table}?limit=1", use_service_role=False)

            if result["success"]:
                print(f"✅ Anon access to '{table}' is allowed (good for public reads)")
            else:
                if result.get("status") == 401:
                    print(f"🔒 Anon access to '{table}' is restricted (RLS is active)")
                else:
                    print(f"⚠️  Unexpected response for '{table}': {result.get('error')}")

    def verify_storage_buckets(self):
        """Verify storage buckets exist"""
        print("\n" + "="*50)
        print("VERIFYING STORAGE BUCKETS")
        print("="*50)

        storage_url = f"{self.base_url}/storage/v1/bucket"
        headers = self.headers_service.copy()

        try:
            response = requests.get(storage_url, headers=headers)
            response.raise_for_status()
            buckets = response.json()

            bucket_names = [bucket.get("name") for bucket in buckets]
            print(f"✅ Found {len(buckets)} storage buckets: {bucket_names}")

            expected_buckets = ["property-photos", "blog-images"]
            for expected in expected_buckets:
                if expected in bucket_names:
                    print(f"✅ Required bucket '{expected}' exists")
                else:
                    print(f"❌ Required bucket '{expected}' is missing")

        except requests.exceptions.RequestException as e:
            print(f"❌ Could not retrieve storage buckets: {str(e)}")

    def run_full_verification(self):
        """Run complete database verification"""
        print("="*60)
        print("SUPABASE DATABASE VERIFICATION")
        print("="*60)

        # Define expected tables
        expected_tables = [
            "properties",
            "property_photos",
            "calendar_events",
            "blog_posts",
            "site_settings"
        ]

        print("\n" + "="*50)
        print("VERIFYING TABLE EXISTENCE")
        print("="*50)

        table_results = {}
        for table in expected_tables:
            exists = self.verify_table_exists(table)
            table_results[table] = exists

        print("\n" + "="*50)
        print("VERIFYING TABLE STRUCTURES")
        print("="*50)

        structure_results = {}
        for table in expected_tables:
            if table_results.get(table):
                structure = self.verify_table_structure(table)
                structure_results[table] = structure

        # Verify sample data
        self.verify_sample_data()

        # Verify RLS policies
        self.verify_rls_policies()

        # Verify storage buckets
        self.verify_storage_buckets()

        # Summary
        print("\n" + "="*50)
        print("VERIFICATION SUMMARY")
        print("="*50)

        all_tables_exist = all(table_results.values())
        print(f"All required tables exist: {'✅ YES' if all_tables_exist else '❌ NO'}")

        for table, exists in table_results.items():
            status = "✅" if exists else "❌"
            print(f"{status} {table}")

        if all_tables_exist:
            print("\n🎉 Database verification completed successfully!")
            print("Your Supabase database appears to be set up correctly.")
        else:
            print("\n⚠️  Some issues were found during verification.")
            print("Please check the errors above and ensure your schema was applied correctly.")

def main():
    verifier = SupabaseVerifier()
    verifier.run_full_verification()

if __name__ == "__main__":
    main()