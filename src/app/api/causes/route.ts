import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/causes`);
    if (!response.ok) {
      throw new Error('Failed to fetch causes');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Error fetching causes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming cause data:', body);

    // Basic validation to match backend structure
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { message: 'Title is required and must be a string', field: 'title' },
        { status: 400 }
      );
    }

    // Convert goal to number and validate
    const goalValue = parseFloat(body.goal);
    if (isNaN(goalValue) || goalValue < 0) {
      return NextResponse.json(
        { message: 'Goal is required and must be a number >= 0', field: 'goal' },
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

    // Prepare payload for backend (exclude updatedAt, convert goal to number)
    const backendPayload = {
      title: body.title,
      goal: goalValue,
      category: body.category,
      description: body.description,
      imageUrl: body.imageUrl
    };

    console.log('Sending to backend:', backendPayload);

    const response = await fetch(`${API_URL}/causes`, {
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

