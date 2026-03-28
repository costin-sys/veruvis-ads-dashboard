import { NextResponse } from 'next/server';
import { checkTokenStatus } from '@/app/lib/meta-token';

export async function GET() {
  try {
    const status = await checkTokenStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
