# Cozy Condo Supabase Setup Instructions

## 🎉 Storage Buckets - COMPLETED ✅

The following storage buckets have been successfully created in your Supabase project:

- **property-photos** (Public) - For property images
- **blog-images** (Public) - For blog post images

**Bucket URLs:**
- Property Photos: `https://pzrdkijtktgdwayjzbfu.supabase.co/storage/v1/object/public/property-photos/`
- Blog Images: `https://pzrdkijtktgdwayjzbfu.supabase.co/storage/v1/object/public/blog-images/`

## 📋 Database Schema - PENDING ACTION REQUIRED

The database schema still needs to be executed manually. Here's how to do it:

### Step 1: Access Supabase Dashboard
1. Go to your Supabase Dashboard: [https://supabase.com/dashboard/project/pzrdkijtktgdwayjzbfu](https://supabase.com/dashboard/project/pzrdkijtktgdwayjzbfu)
2. Navigate to **SQL Editor** in the left sidebar

### Step 2: Execute the Schema
1. Open the file `/mnt/m/AI/cozy-condo/supabase/schema.sql` in your text editor
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click **Run** to execute the schema

### Step 3: Verify Installation
After executing the schema, run the verification script:

```bash
python3 /mnt/m/AI/cozy-condo/verify_schema.py
```

## 📊 What the Schema Creates

The schema will create the following tables:

### Core Tables:
1. **properties** - Store property information (condos)
   - Fields: name, slug, description, location, amenities, etc.
   - Includes 3 sample properties

2. **property_photos** - Store property images
   - Links to properties table
   - Supports primary image selection and ordering

3. **calendar_events** - Store booking/availability calendar
   - Links to properties table
   - Supports manual and Airbnb sync

4. **blog_posts** - Store blog content
   - Fields: title, slug, content, published status, etc.

5. **site_settings** - Store global site configuration
   - Pre-populated with Cozy Condo default settings

### Security Features:
- **Row Level Security (RLS)** enabled on all tables
- **Public read policies** for published content
- **Service role full access** for admin operations
- **Proper indexes** for optimal query performance

### Automation:
- **Auto-updating timestamps** via triggers
- **UUID primary keys** for all tables
- **Foreign key constraints** for data integrity

## 🔧 Sample Data Included

The schema includes sample data:
- 3 sample properties (Cityscape Studio, Garden View Suite, Downtown Retreat)
- Default site settings with Cozy Condo branding
- Contact information and social media links

## 🚀 Next Steps

After executing the schema:

1. **Verify Installation**: Run the verification script
2. **Customize Settings**: Update site settings through your admin interface
3. **Add Real Properties**: Replace sample properties with actual listings
4. **Test Integration**: Ensure your application can connect and retrieve data
5. **Set up Authentication**: Configure user authentication if needed

## 📁 File Locations

- Schema File: `/mnt/m/AI/cozy-condo/supabase/schema.sql`
- Verification Script: `/mnt/m/AI/cozy-condo/verify_schema.py`
- Storage Setup Script: `/mnt/m/AI/cozy-condo/setup_storage.py`

## 🔗 Connection Details

- **Supabase URL**: `https://pzrdkijtktgdwayjzbfu.supabase.co`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmRraWp0a3RnZHdheWp6YmZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQzNzk1NywiZXhwIjoyMDgxMDEzOTU3fQ.1VsOC1-fGZsIJ-_Ulc47Qov5bmjLqvGvz9VoQbwrVeM`

⚠️ **Security Note**: The service role key provides full database access. Keep it secure and only use it server-side.

---

## ❓ Troubleshooting

If you encounter any issues:

1. **Tables not found**: Make sure you executed the complete schema in the SQL Editor
2. **Permission denied**: Verify you're using the correct service role key
3. **Storage issues**: Buckets are already created and ready to use
4. **Sample data conflicts**: The schema uses `ON CONFLICT DO NOTHING` to prevent duplicates

For additional help, run the verification script to get detailed status information.