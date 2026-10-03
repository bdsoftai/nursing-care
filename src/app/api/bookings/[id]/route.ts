import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        if (!customerId) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const booking = await db().findBookingById(id, customerId);

        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'বুকিং পাওয়া যায়নি' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, booking, source: 'database' });
    } catch (err) {
        console.error('[/api/bookings/:id]', err);
        return NextResponse.json(
            { success: false, message: 'লোড ব্যর্থ' },
            { status: 500 }
        );
    }
}