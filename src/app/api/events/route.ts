import { NextResponse } from 'next/server';
import { Event } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming event data:', body);

    // Basic validation
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { message: 'Title is required and must be a string', field: 'title' },
        { status: 400 }
      );
    }

    if (!body.shortDescription || typeof body.shortDescription !== 'string') {
      return NextResponse.json(
        { message: 'Short description is required and must be a string', field: 'shortDescription' },
        { status: 400 }
      );
    }

    if (!body.category || typeof body.category !== 'string') {
      return NextResponse.json(
        { message: 'Category is required and must be a string', field: 'category' },
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

    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json(
        { message: 'Date is required and must be a string', field: 'date' },
        { status: 400 }
      );
    }

    if (!body.time || typeof body.time !== 'string') {
      return NextResponse.json(
        { message: 'Time is required and must be a string', field: 'time' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend rejection:', {
        status: response.status,
        error: errorData,
        sentPayload: body
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