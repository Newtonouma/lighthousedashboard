import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const response = await fetch(`${API_URL}/causes/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: `Cause with ID ${id} not found` },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch cause');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching cause:', err);
    return NextResponse.json(
      { message: 'Error fetching cause' },
      { status: 500 }
    );
  }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;
      const body = await request.json();
  
      // Clean the request body according to backend expectations
      const cleanedBody = {
        title: body.title,
        description: body.description,
        category: body.category,
        goal: body.goal,
        images: body.images?.map(({ url, alt }) => ({ url, alt })),
        // Only include properties your backend accepts
      };
  
      const response = await fetch(`${API_URL}/causes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedBody),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        // Forward the backend's error response
        return NextResponse.json(errorData, { status: response.status });
      }
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (err) {
      console.error('Error updating cause:', err);
      return NextResponse.json(
        { 
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    const { id } = params;
    const response = await fetch(`${API_URL}/causes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: `Cause with ID ${id} not found` },
          { status: 404 }
        );
      }
      throw new Error('Failed to delete cause');
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Error deleting cause:', err);
    return NextResponse.json(
      { message: 'Error deleting cause' },
      { status: 500 }
    );
  }
} 