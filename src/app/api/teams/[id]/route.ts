import { NextResponse } from 'next/server';
import { validateTeamData } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_URL}/teams/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: `Team with ID ${id} not found` },
          { status: 404 }
        );
      }
      throw new Error('Failed to fetch team');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching team:', err);
    return NextResponse.json(
      { message: 'Error fetching team' },
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
    console.log('Updating team data:', body);

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

    const response = await fetch(`${API_URL}/teams/${id}`, {
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
    console.error('Error updating team:', err);
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
    const response = await fetch(`${API_URL}/teams/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { message: `Team with ID ${id} not found` },
          { status: 404 }
        );
      }
      throw new Error('Failed to delete team');
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('Error deleting team:', err);
    return NextResponse.json(
      { message: 'Error deleting team' },
      { status: 500 }
    );
  }
}