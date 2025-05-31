import { NextResponse } from 'next/server';
import { uploadToSupabase } from '@/lib/cloudinary';

// File validation constants
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760'); // 10MB default
const ALLOWED_TYPES = process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp', 
  'image/gif'
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if we have Supabase configuration
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (hasSupabaseConfig) {
      try {
        // Use Supabase Storage
        const uploadResult = await uploadToSupabase(buffer, file.name, 'dashboard-uploads', 'uploads');
        
        return NextResponse.json({
          url: uploadResult.url,
          path: uploadResult.path,
          filename: file.name,
          size: file.size,
          type: file.type,
          provider: 'supabase'
        });
      } catch (supabaseError) {
        console.error('Supabase upload failed, falling back to local storage:', supabaseError);
        // Fall through to local storage
      }
    }
    
    // Fallback to local storage (development or if Supabase fails)
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const publicDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }
    
    const filepath = join(publicDir, filename);
    await writeFile(filepath, buffer);
    
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({
      url,
      filename,
      size: file.size,
      type: file.type,
      provider: 'local'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Error uploading file',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}