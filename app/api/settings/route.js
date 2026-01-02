import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const settings = await kv.get(`settings:${userId}`) || {};
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({});
  }
}

export async function POST(request) {
  const body = await request.json();
  const { userId, ouraToken } = body;

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  try {
    const existing = await kv.get(`settings:${userId}`) || {};
    const updated = { ...existing, ouraToken };
    await kv.set(`settings:${userId}`, updated);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
