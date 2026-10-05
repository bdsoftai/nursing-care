import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, message: 'Status প্রয়োজন' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    await db().updateBookingStatus(id, body.status);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[PATCH /api/admin/bookings/:id]', err);
    return NextResponse.json(
      { success: false, message: err.message ?? 'আপডেট ব্যর্থ' },
      { status: 500 }
    );
  }
}
