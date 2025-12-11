#!/usr/bin/env python3
"""
Schema verification script to check table structures in detail
"""

import requests

# Supabase configuration
SUPABASE_URL = "https://pzrdkijtktgdwayjzbfu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM"

def check_table_schema(table_name):
    """Check table schema by examining the first row"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?limit=1"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data:
            return data[0]
        else:
            # If table is empty, try to insert a test record to see the structure
            return None
    return None

def main():
    print("SCHEMA VERIFICATION")
    print("="*60)

    expected_schemas = {
        'properties': [
            'id', 'name', 'slug', 'description', 'short_description',
            'location', 'address', 'map_url', 'airbnb_url', 'airbnb_ical_url',
            'amenities', 'featured', 'active', 'display_order', 'created_at', 'updated_at'
        ],
        'property_photos': [
            'id', 'property_id', 'url', 'alt_text', 'display_order',
            'is_primary', 'created_at', 'updated_at'
        ],
        'calendar_events': [
            'id', 'property_id', 'event_date', 'event_type', 'price',
            'notes', 'created_at', 'updated_at'
        ],
        'blog_posts': [
            'id', 'title', 'slug', 'excerpt', 'content', 'featured_image_url',
            'author', 'status', 'published_at', 'created_at', 'updated_at'
        ],
        'site_settings': [
            'id', 'site_name', 'tagline', 'description', 'phone', 'email',
            'facebook_url', 'messenger_url', 'address', 'logo_url',
            'hero_title', 'hero_subtitle', 'about_title', 'about_content',
            'created_at', 'updated_at'
        ]
    }

    for table_name, expected_columns in expected_schemas.items():
        print(f"\nChecking {table_name.upper()} table:")
        print("-" * 40)

        sample_row = check_table_schema(table_name)
        if sample_row:
            actual_columns = list(sample_row.keys())
            print(f"✅ Table exists with {len(actual_columns)} columns")

            # Check if all expected columns exist
            missing_columns = set(expected_columns) - set(actual_columns)
            extra_columns = set(actual_columns) - set(expected_columns)

            if not missing_columns and not extra_columns:
                print("✅ All expected columns present and no extras")
            else:
                if missing_columns:
                    print(f"❌ Missing columns: {list(missing_columns)}")
                if extra_columns:
                    print(f"⚠️  Extra columns: {list(extra_columns)}")

            print(f"Actual columns: {actual_columns}")
        else:
            print("⚠️  Table exists but is empty - cannot verify full schema")

if __name__ == "__main__":
    main()