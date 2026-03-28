import { NextResponse } from 'next/server';
import { refreshAccessToken, checkTokenStatus } from '@/app/lib/meta-token';

export async function POST() {
  try {
    const { newToken, expiresIn, expiresAt } = await refreshAccessToken();
    const status = await checkTokenStatus();

    const expiresDate = new Date(expiresAt * 1000).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return NextResponse.json({
      success: true,
      newToken,
      expiresIn,
      expiresAt,
      expiresDate,
      daysUntilExpiry: status.daysUntilExpiry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
