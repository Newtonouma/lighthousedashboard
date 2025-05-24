import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const response = await fetch(`${API_URL}/gallery/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update gallery item');
    }

    const updatedItem = await response.json();
    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error('Error updating gallery item:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error updating gallery item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_URL}/gallery/${params.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete gallery item');
    }

    return NextResponse.json(
      { message: 'Gallery item deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error deleting gallery item:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Error deleting gallery item' },
      { status: 500 }
    );
  }
} 