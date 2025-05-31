// Supabase Storage configuration for production file upload
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role for file operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface UploadResult {
  path: string;
  url: string;
  fullPath: string;
  bucket: string;
  id: string;
}

export const uploadToSupabase = async (
  file: Buffer,
  fileName: string,
  bucket: string = 'dashboard-uploads',
  folder: string = 'images'
): Promise<UploadResult> => {
  try {
    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomId = Math.round(Math.random() * 1E9);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${folder}/${timestamp}-${randomId}.${fileExtension}`;

    console.log(`Attempting to upload to Supabase: ${bucket}/${uniqueFileName}`);

    // Upload file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(uniqueFileName, file, {
        contentType: getContentType(fileExtension || ''),
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error details:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload succeeded but no data returned from Supabase');
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log(`Upload successful: ${urlData.publicUrl}`);

    return {
      path: data.path,
      url: urlData.publicUrl,
      fullPath: data.fullPath,
      bucket,
      id: data.id || data.path
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }
};

export const deleteFromSupabase = async (
  filePath: string,
  bucket: string = 'dashboard-uploads'
): Promise<void> => {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
    throw error;
  }
};

export const getSupabaseFileUrl = (
  filePath: string,
  bucket: string = 'dashboard-uploads'
): string => {
  const { data } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Helper function to determine content type
const getContentType = (extension: string): string => {
  const contentTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  
  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
};

export default supabaseAdmin;
