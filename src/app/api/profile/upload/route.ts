import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Disable nextjs body parsing, we'll handle it via formData
export const config = {
  api: {
    bodyParser: false,
  },
};

// Define upload directory - could be configured via env vars
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Ensure the upload directory exists
export async function ensureUploadDir() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    console.log('Upload request received', { 
      formDataKeys: [...formData.keys()],
      hasFile: !!file,
      environment: process.env.NODE_ENV
    });

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Verify file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Limit file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    let imageUrl = '';
    
    if (IS_PRODUCTION && process.env.USE_CLOUD_STORAGE === 'true') {
      // For production with cloud storage:
      // Here you would typically upload to a service like AWS S3, Cloudinary, etc.
      // This is a placeholder - implement your cloud storage solution here
      
      /* Example for Cloudinary (requires cloudinary npm package):
      
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });
      
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'profile-images' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      imageUrl = result.secure_url;
      */
      
      // For now, fall back to local storage in production too
      await ensureUploadDir();
      const filePath = join(UPLOAD_DIR, fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
      
      console.log('Production mode: Using local storage as fallback', { imageUrl });
    } else {
      // Development mode - save to local filesystem
      await ensureUploadDir();
      const filePath = join(UPLOAD_DIR, fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
      
      console.log('Development mode: File written to local filesystem', { filePath });
    }

    console.log('Upload successful', { imageUrl });
    
    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 