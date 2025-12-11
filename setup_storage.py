#!/usr/bin/env python3
"""
Script to set up storage buckets in Supabase
"""
import requests
import json

def setup_storage_buckets():
    """Set up the required storage buckets in Supabase"""
    base_url = "https://pzrdkijtktgdwayjzbfu.supabase.co"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM",
        "Content-Type": "application/json"
    }

    buckets = [
        {
            "id": "property-photos",
            "name": "property-photos",
            "public": True,
            "file_size_limit": None,
            "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
        },
        {
            "id": "blog-images",
            "name": "blog-images",
            "public": True,
            "file_size_limit": None,
            "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
        }
    ]

    print("Setting up Supabase storage buckets...")
    print("=" * 50)

    # First, let's check existing buckets
    print("Checking existing buckets...")
    try:
        response = requests.get(f"{base_url}/storage/v1/bucket", headers=headers, timeout=10)
        if response.status_code == 200:
            existing_buckets = response.json()
            existing_bucket_names = [bucket["name"] for bucket in existing_buckets]
            print(f"Existing buckets: {existing_bucket_names}")
        else:
            print(f"Could not retrieve existing buckets: {response.status_code}")
            existing_bucket_names = []
    except Exception as e:
        print(f"Error checking buckets: {e}")
        existing_bucket_names = []

    success_count = 0

    for bucket in buckets:
        print(f"\nCreating bucket: {bucket['id']}")

        if bucket["id"] in existing_bucket_names:
            print(f"✅ Bucket '{bucket['id']}' already exists")
            success_count += 1
            continue

        try:
            # Create bucket
            create_payload = {
                "id": bucket["id"],
                "name": bucket["name"],
                "public": bucket["public"]
            }

            response = requests.post(
                f"{base_url}/storage/v1/bucket",
                headers=headers,
                json=create_payload,
                timeout=10
            )

            if response.status_code in [200, 201]:
                print(f"✅ Successfully created bucket '{bucket['id']}'")
                success_count += 1

                # Set bucket to public
                if bucket["public"]:
                    public_payload = {"public": True}
                    public_response = requests.put(
                        f"{base_url}/storage/v1/bucket/{bucket['id']}",
                        headers=headers,
                        json=public_payload,
                        timeout=10
                    )

                    if public_response.status_code == 200:
                        print(f"   └── Set bucket to public access")
                    else:
                        print(f"   └── Warning: Could not set public access")

            else:
                print(f"❌ Failed to create bucket '{bucket['id']}': {response.status_code}")
                try:
                    error = response.json()
                    print(f"   └── Error: {error}")
                except:
                    print(f"   └── Error: {response.text}")

        except Exception as e:
            print(f"❌ Exception creating bucket '{bucket['id']}': {e}")

    print("\n" + "=" * 50)

    if success_count == len(buckets):
        print("🎉 All storage buckets are ready!")
        print("\nBucket URLs:")
        for bucket in buckets:
            print(f"- {bucket['id']}: {base_url}/storage/v1/object/public/{bucket['id']}/")
    else:
        print(f"⚠️  {success_count}/{len(buckets)} buckets are ready.")
        print("\nYou may need to create buckets manually in the Supabase Dashboard:")
        print("1. Go to Storage section in your Supabase Dashboard")
        print("2. Create buckets: 'property-photos' and 'blog-images'")
        print("3. Set both buckets to 'Public' access")

    return success_count == len(buckets)

if __name__ == "__main__":
    setup_storage_buckets()