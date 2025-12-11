#!/usr/bin/env python3
"""
Detailed data verification script for Supabase database
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://pzrdkijtktgdwayjzbfu.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM"

def get_data(table_name):
    """Get all data from a table"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching {table_name}: {response.status_code} - {response.text}")
        return None

def main():
    print("DETAILED DATA VERIFICATION")
    print("="*50)

    # Check properties
    print("\n1. PROPERTIES TABLE:")
    print("-" * 30)
    properties = get_data("properties")
    if properties:
        print(f"Total properties: {len(properties)}")
        for i, prop in enumerate(properties, 1):
            print(f"\nProperty {i}:")
            print(f"  ID: {prop.get('id')}")
            print(f"  Name: {prop.get('name')}")
            print(f"  Slug: {prop.get('slug')}")
            print(f"  Description: {prop.get('description', 'N/A')[:100]}...")
            print(f"  Location: {prop.get('location')}")
            print(f"  Amenities: {prop.get('amenities')}")
            print(f"  Featured: {prop.get('featured')}")
            print(f"  Active: {prop.get('active')}")

    # Check site settings
    print("\n2. SITE_SETTINGS TABLE:")
    print("-" * 30)
    settings = get_data("site_settings")
    if settings:
        print(f"Total settings records: {len(settings)}")
        for setting in settings:
            print(f"\nSite Settings:")
            print(f"  ID: {setting.get('id')}")
            print(f"  Site Name: {setting.get('site_name')}")
            print(f"  Tagline: {setting.get('tagline')}")
            print(f"  Description: {setting.get('description', 'N/A')[:100]}...")
            print(f"  Phone: {setting.get('phone')}")
            print(f"  Email: {setting.get('email')}")
            print(f"  Hero Title: {setting.get('hero_title')}")
            print(f"  Hero Subtitle: {setting.get('hero_subtitle')}")

    # Check property photos
    print("\n3. PROPERTY_PHOTOS TABLE:")
    print("-" * 30)
    photos = get_data("property_photos")
    if photos:
        print(f"Total photos: {len(photos)}")
        for photo in photos:
            print(f"  Property ID: {photo.get('property_id')}, URL: {photo.get('url')}")
    else:
        print("No photos found")

    # Check calendar events
    print("\n4. CALENDAR_EVENTS TABLE:")
    print("-" * 30)
    events = get_data("calendar_events")
    if events:
        print(f"Total events: {len(events)}")
        for event in events:
            print(f"  Property ID: {event.get('property_id')}, Date: {event.get('event_date')}, Type: {event.get('event_type')}")
    else:
        print("No events found")

    # Check blog posts
    print("\n5. BLOG_POSTS TABLE:")
    print("-" * 30)
    posts = get_data("blog_posts")
    if posts:
        print(f"Total blog posts: {len(posts)}")
        for post in posts:
            print(f"  Title: {post.get('title')}, Status: {post.get('status')}")
    else:
        print("No blog posts found")

if __name__ == "__main__":
    main()