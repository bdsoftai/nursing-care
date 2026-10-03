import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db().approveNurse(id, '');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/admin/nurses/:id/approve]', err);
    return NextResponse.json(
      { success: false, message: 'অনুমোদন ব্যর্থ' },
      { status: 500 }
    );
  }
}
