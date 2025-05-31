import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('Deleting image:', imageUrl);

    // Extract the file path from the full URL
    // Expected format: https://supabase-url/storage/v1/object/public/bucket/path
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'public') + 1;
    
    if (bucketIndex === 0) {
      // Fallback: try to extract filename from URL
      const filename = urlParts[urlParts.length - 1];
      const filePath = `uploads/${filename}`;
      
      console.log('Extracted file path (fallback):', filePath);
      
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        console.error('Supabase deletion error:', error);
        return NextResponse.json(
          { error: 'Failed to delete image from storage' },
          { status: 500 }
        );
      }
    } else {
      // Extract the path after the bucket name
      const filePath = urlParts.slice(bucketIndex).join('/');
      
      console.log('Extracted file path:', filePath);
      
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        console.error('Supabase deletion error:', error);
        return NextResponse.json(
          { error: 'Failed to delete image from storage' },
          { status: 500 }
        );
      }
    }

    console.log('Image deleted successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
