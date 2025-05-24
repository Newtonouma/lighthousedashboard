import { NextResponse } from 'next/server';
import { UpdateTeamDto } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data: UpdateTeamDto = await request.json();
    const response = await fetch(`${API_URL}/teams/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update team');
    }

    const updatedTeam = await response.json();
    return NextResponse.json(updatedTeam);
  } catch (err) {
    console.error('Error updating team:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error updating team' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/teams/${params.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete team');
    }

    return NextResponse.json(
      { message: 'Team deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error deleting team:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error deleting team' },
      { status: 500 }
    );
  }
} 