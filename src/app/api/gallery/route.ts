import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/gallery`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch gallery items');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error fetching gallery' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const response = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create gallery item');
    }

    const newItem = await response.json();
    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error('Error creating gallery item:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error creating gallery item' },
      { status: 500 }
    );
  }
} 