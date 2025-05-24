import { NextResponse } from 'next/server';
import { CreateTeamDto, validateTeamData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/teams`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch teams');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching teams:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error fetching teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data: CreateTeamDto = await request.json();
    
    // Validate the data before sending to the API
    const validationError = validateTeamData(data);
    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create team');
    }

    const newTeam = await response.json();
    return NextResponse.json(newTeam, { status: 201 });
  } catch (err) {
    console.error('Error creating team:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error creating team' },
      { status: 500 }
    );
  }
}