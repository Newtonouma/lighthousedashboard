import { NextResponse } from 'next/server';
import { validateEventData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return NextResponse.json(data);  } catch (err) {
    console.error('Error fetching events:', err);
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

    // Basic validation to match backend structure
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { message: 'Title is required and must be a string', field: 'title' },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== 'string') {
      return NextResponse.json(
        { message: 'Description is required and must be a string', field: 'description' },
        { status: 400 }
      );
    }

    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json(
        { message: 'Date is required and must be a string', field: 'date' },
        { status: 400 }
      );
    }

    if (!body.location || typeof body.location !== 'string') {
      return NextResponse.json(
        { message: 'Location is required and must be a string', field: 'location' },
        { status: 400 }
      );
    }

    if (!body.imageUrl || typeof body.imageUrl !== 'string') {
      return NextResponse.json(
        { message: 'Image URL is required and must be a string', field: 'imageUrl' },
        { status: 400 }
      );
    }

    // Validate event data
    const validationError = validateEventData(body);
    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }    // Prepare payload for backend (exclude updatedAt/createdAt)
    const backendPayload: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      date: body.date,
      location: body.location,
      imageUrl: body.imageUrl,
    };

    // Format endTime to ISO string if provided
    if (body.endTime) {
      // If endTime is just time (e.g., "17:00"), combine with date
      if (body.endTime.length <= 8 && body.endTime.includes(':')) {
        const eventDate = new Date(body.date);
        const [hours, minutes] = body.endTime.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        backendPayload.endTime = eventDate.toISOString();
      } else {
        // If it's already an ISO string, use as-is
        backendPayload.endTime = body.endTime;
      }
    }

    console.log('Sending to backend:', backendPayload);

    const response = await fetch(`${API_URL}/events`, {
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