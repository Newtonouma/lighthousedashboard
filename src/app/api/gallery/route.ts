import { NextResponse } from 'next/server';
import { validateGalleryData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/gallery`);
    if (!response.ok) {
      throw new Error('Failed to fetch gallery items');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    return NextResponse.json(
      { message: 'Error fetching gallery items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming gallery data:', body);

    // Convert frontend format to backend format
    let galleryData;
    if (body.title || body.description) {
      // Frontend is sending title/description format, convert to caption
      galleryData = {
        caption: body.title || body.description || 'Untitled',
        imageUrl: body.imageUrl
      };
    } else {
      // Already in backend format
      galleryData = body;
    }

    // Validate gallery data
    const validationError = validateGalleryData(galleryData);
    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    // Prepare payload for backend
    const backendPayload = {
      caption: galleryData.caption,
      imageUrl: galleryData.imageUrl
    };

    console.log('Sending to backend:', backendPayload);

    const response = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend rejection:', {
        status: response.status,
        error: errorData,
        sentPayload: backendPayload
      });
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      {
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}