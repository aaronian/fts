import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const entries = await kv.get(`entries:${userId}`) || [];
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json({ entries: [] });
  }
}

export async function POST(request) {
  const body = await request.json();
  const { userId, entries } = body;

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    await kv.set(`entries:${userId}`, entries);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving entries:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
