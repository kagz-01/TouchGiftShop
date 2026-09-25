import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role to bypass RLS for uploads

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Paths
const IMAGES_DIR = path.join(process.cwd(), 'catalog_images');
const INPUT_CSV = path.join(process.cwd(), 'master_catalog.csv');
const OUTPUT_CSV = path.join(process.cwd(), 'final_import_ready.csv');
const BUCKET_NAME = 'products'; // Ensure this bucket exists in Supabase Storage

async function run() {
  console.log('🚀 Starting Catalog Upload Script...');

  // 1. Read all images from the folder
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Images folder not found: ${IMAGES_DIR}. Please create it and add your images.`);
    process.exit(1);
  }
  const files = fs.readdirSync(IMAGES_DIR).filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i));
  console.log(`📸 Found ${files.length} images to process.`);

  // Dictionary to hold SKU -> { mainImage: URL, extraImages: [URL1, URL2] }
  const imageMapping = {};

  // 2. Upload images and build mapping
  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    // Parse filename: "CORP-001.jpg" (main) or "CORP-001-2.jpg" (extra)
    const baseName = path.parse(file).name;
    const parts = baseName.split('-');
    
    // If it has 3 parts (e.g., CORP-001-2), it's an extra image. If 2 (CORP-001), it's main.
    // This assumes your SKU is format XXX-YYY (like CORP-001).
    // Let's use a simpler rule: if the last part is a single digit (like 2,3,4), it's an extra image.
    let sku = baseName;
    let isExtra = false;
    
    const lastPart = parts[parts.length - 1];
    if (/^\d$/.test(lastPart) && parts.length > 1) {
      sku = parts.slice(0, -1).join('-'); // e.g. "CORP-001"
      isExtra = true;
    }

    const uploadPath = `catalog/${file}`; // Organize inside a 'catalog' folder in the bucket
    console.log(`⬆️ Uploading ${file}...`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uploadPath, fileBuffer, {
        upsert: true, // Replace if exists
        contentType: `image/${path.extname(file).replace('.', '')}`
      });

    if (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message);
      continue;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadPath);
    const publicUrl = publicUrlData.publicUrl;

    if (!imageMapping[sku]) {
      imageMapping[sku] = { mainImage: '', extraImages: [] };
    }

    if (isExtra) {
      imageMapping[sku].extraImages.push(publicUrl);
    } else {
      imageMapping[sku].mainImage = publicUrl;
    }
  }

  console.log('✅ Image upload complete! Building final CSV...');

  // 3. Read the master CSV and inject URLs
  if (!fs.existsSync(INPUT_CSV)) {
    console.error(`❌ Input CSV not found: ${INPUT_CSV}. Please create it with your product details.`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(INPUT_CSV, 'utf8');
  const records = parse(csvContent, { columns: true, skip_empty_lines: true });

  const finalRecords = records.map(record => {
    const sku = record.sku;
    const mapping = imageMapping[sku];
    
    if (mapping) {
      record.image_url = mapping.mainImage || record.image_url;
      // Combine extra images as JSON string
      record.images = mapping.extraImages.length > 0 ? JSON.stringify(mapping.extraImages) : '[]';
    } else {
      console.warn(`⚠️ Warning: No images found for SKU: ${sku}`);
      if (!record.images) record.images = '[]';
    }
    
    return record;
  });

  // 4. Write the final CSV
  const finalCsvContent = stringify(finalRecords, { header: true });
  fs.writeFileSync(OUTPUT_CSV, finalCsvContent);

  console.log(`🎉 Success! Your import-ready file is saved at: ${OUTPUT_CSV}`);
  console.log(`➡️  Next step: Upload this file to the Supabase dashboard.`);
}

run().catch(console.error);
