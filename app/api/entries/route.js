import { NextResponse } from 'next/server';

// In-memory storage (in production, use a real database)
const storage = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }
  
  const userData = storage.get(userId);
  
  return NextResponse.json({
    entries: userData?.entries || []
  });
}

export async function POST(request) {
  const body = await request.json();
  const { userId, entries } = body;
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }
  
  storage.set(userId, { entries });
  
  return NextResponse.json({ success: true });
}
