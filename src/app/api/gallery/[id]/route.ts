import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_URL}/gallery/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch gallery item');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching gallery item:', err);
    return NextResponse.json(
      { message: 'Error fetching gallery item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('Updating gallery item:', id, body);

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

    // Prepare payload for backend
    const backendPayload = {
      caption: galleryData.caption,
      imageUrl: galleryData.imageUrl
    };

    console.log('Sending to backend:', backendPayload);

    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'PATCH',
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
    return NextResponse.json(data);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete gallery item');
    }

    return NextResponse.json({ message: 'Gallery item deleted successfully' });  } catch (err) {
    console.error('Error deleting gallery item:', err);
    return NextResponse.json(
      { message: 'Error deleting gallery item' },
      { status: 500 }
    );
  }
}