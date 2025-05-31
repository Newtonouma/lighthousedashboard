import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_URL}/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching event:', err);
    return NextResponse.json(
      { message: 'Error fetching event' },
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
    console.log('Updating event:', id, body);    // Prepare payload for backend (exclude updatedAt/createdAt)
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

    const response = await fetch(`${API_URL}/events/${id}`, {
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
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    return NextResponse.json(
      { message: 'Error deleting event' },
      { status: 500 }
    );
  }
}