#!/usr/bin/env node

/**
 * Migration script to convert base64 encoded images in the database
 * to proper Supabase Storage URLs for better performance and smaller payloads
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env files (Next.js style)
const path = require('path');
const fs = require('fs');

// Simple .env file loader
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }
}

// Load environment variables
loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function uploadBase64Image(base64Data, fileName = 'image.jpg', bucketName = 'property-images') {
  try {
    // Remove data:image prefix if present
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');

    // Generate unique filename
    const fileExt = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    console.log(`  📤 Uploading ${uniqueFileName} (${Math.round(buffer.length / 1024)}KB)`);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('  ❌ Error uploading image:', error.message);
    throw error;
  }
}

async function migratePropertyImages() {
  console.log('🏠 Starting property images migration...');

  try {
    // Get all property photos with base64 data
    const { data: photos, error } = await supabase
      .from('property_photos')
      .select('*')
      .like('url', 'data:image%');

    if (error) {
      throw error;
    }

    console.log(`📊 Found ${photos.length} base64 images to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const photo of photos) {
      try {
        console.log(`\n🔄 Processing photo ID ${photo.id}...`);

        // Upload base64 image to storage
        const newUrl = await uploadBase64Image(photo.url, `property-${photo.id}.jpg`);

        // Update the database record
        const { error: updateError } = await supabase
          .from('property_photos')
          .update({ url: newUrl })
          .eq('id', photo.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`  ✅ Updated photo ${photo.id} with new URL: ${newUrl}`);
        successCount++;

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`  ❌ Failed to migrate photo ${photo.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📈 Property images migration completed:`);
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);

    return { success: successCount, errors: errorCount };
  } catch (error) {
    console.error('❌ Error in property images migration:', error);
    throw error;
  }
}

async function migrateWebsiteSettings() {
  console.log('\n⚙️ Starting website settings migration...');

  try {
    // Get website settings with base64 images
    const { data: settings, error } = await supabase
      .from('website_settings')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    if (!settings || settings.length === 0) {
      console.log('ℹ️ No website settings found');
      return { success: 0, errors: 0 };
    }

    // Use first settings record
    const settingsRecord = settings[0];
    const updates = {};
    let migrationCount = 0;

    // Check each image field
    const imageFields = ['logo', 'logoMobile', 'heroBackground', 'highlyRatedImage', 'aboutImage'];

    for (const field of imageFields) {
      if (settingsRecord[field] && settingsRecord[field].startsWith('data:image')) {
        try {
          console.log(`\n🔄 Processing ${field}...`);
          const newUrl = await uploadBase64Image(settingsRecord[field], `setting-${field}.jpg`, 'website-assets');
          updates[field] = newUrl;
          console.log(`  ✅ Migrated ${field} to: ${newUrl}`);
          migrationCount++;
        } catch (error) {
          console.error(`  ❌ Failed to migrate ${field}:`, error.message);
        }
      } else if (settingsRecord[field]) {
        console.log(`  ℹ️ ${field} is already a URL, skipping`);
      } else {
        console.log(`  ℹ️ ${field} is empty, skipping`);
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('website_settings')
        .update(updates)
        .eq('id', settingsRecord.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`\n✅ Updated website settings with ${Object.keys(updates).length} new URLs`);
    } else {
      console.log('\nℹ️ No website settings images needed migration');
    }

    return { success: migrationCount, errors: 0 };
  } catch (error) {
    console.error('❌ Error in website settings migration:', error);
    return { success: 0, errors: 1 };
  }
}

async function ensureStorageBuckets() {
  console.log('🪣 Ensuring storage buckets exist...');

  const buckets = ['property-images', 'website-assets'];

  for (const bucketName of buckets) {
    try {
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);

      if (!bucketExists) {
        console.log(`  🆕 Creating bucket: ${bucketName}`);
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });

        if (error) {
          throw error;
        }
        console.log(`  ✅ Created bucket: ${bucketName}`);
      } else {
        console.log(`  ✅ Bucket ${bucketName} already exists`);
      }
    } catch (error) {
      console.error(`  ❌ Error with bucket ${bucketName}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting base64 images migration to Supabase Storage\n');

  try {
    // Ensure storage buckets exist
    await ensureStorageBuckets();

    // Migrate property images
    const propertyResults = await migratePropertyImages();

    // Migrate website settings images
    const settingsResults = await migrateWebsiteSettings();

    const totalSuccess = propertyResults.success + settingsResults.success;
    const totalErrors = propertyResults.errors + settingsResults.errors;

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Total Results:`);
    console.log(`  ✅ Total Success: ${totalSuccess}`);
    console.log(`  ❌ Total Errors: ${totalErrors}`);

    if (totalErrors === 0) {
      console.log('\n🎊 All images migrated successfully! The production website should now load images properly.');
    } else {
      console.log(`\n⚠️ Migration completed with ${totalErrors} errors. Check the logs above for details.`);
    }

  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
main().catch(console.error);