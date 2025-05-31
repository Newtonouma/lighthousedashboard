import { NextResponse } from 'next/server';
import { validateTeamData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/teams`);
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Error fetching teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming team data:', body);

    // Basic validation to match backend structure
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { message: 'Name is required and must be a string', field: 'name' },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json(
        { message: 'Description is required and must be a string', field: 'description' },
        { status: 400 }
      );
    }

    if (!body.imageUrl || typeof body.imageUrl !== 'string') {
      return NextResponse.json(
        { message: 'Image URL is required and must be a string', field: 'imageUrl' },
        { status: 400 }
      );
    }

    // Validate URLs and email if provided
    const validationError = validateTeamData(body);
    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    // Prepare payload for backend (exclude updatedAt/createdAt)
    const backendPayload = {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      ...(body.contact && { contact: body.contact }),
      ...(body.email && { email: body.email }),
      ...(body.facebook && { facebook: body.facebook }),
      ...(body.linkedin && { linkedin: body.linkedin }),
      ...(body.twitter && { twitter: body.twitter }),
      ...(body.tiktok && { tiktok: body.tiktok })
    };

    console.log('Sending to backend:', backendPayload);

    const response = await fetch(`${API_URL}/teams`, {
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