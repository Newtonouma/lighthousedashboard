import { NextResponse } from 'next/server';
import { Cause } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/causes`);
    if (!response.ok) {
      throw new Error('Failed to fetch causes');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching causes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming body from frontend:', body);

    // Basic validation
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

    const goal = Number(body.goal);
    if (isNaN(goal) || goal < 0) {
      return NextResponse.json(
        { message: 'Goal must be a valid non-negative number', field: 'goal' },
        { status: 400 }
      );
    }

    // Clean and transform the data to match backend expectations
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const cleanedBody = {
      title: body.title.trim(),
      description: body.description,
      category: body.category,
      goal: goal,
      images: body.images?.map((img: { url: string; alt: string }) => {
        // Ensure the URL is properly formatted
        const imageUrl = img.url.startsWith('http') 
          ? img.url 
          : `${baseUrl}${img.url.startsWith('/') ? '' : '/'}${img.url}`;
        
        return {
          url: imageUrl,
          alt: img.alt || body.title.trim()
        };
      }) || []
    };

    console.log('Cleaned payload to backend:', cleanedBody);

    const response = await fetch(`${API_URL}/causes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      },
      body: JSON.stringify(cleanedBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend rejection:', {
        status: response.status,
        error: errorData,
        sentPayload: cleanedBody
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

