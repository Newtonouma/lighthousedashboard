import { NextResponse } from 'next/server';
import { Event } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/events/${params.id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching event' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('Updating event:', params.id, body);

    const response = await fetch(`${API_URL}/events/${params.id}`, {
      method: 'PATCH',
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
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/events/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error deleting event' },
      { status: 500 }
    );
  }
} 