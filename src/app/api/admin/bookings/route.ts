import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const bookings = await db().getAllBookings();

        console.log(`📊 [/api/admin/bookings] Found ${bookings.length} bookings`);

        return NextResponse.json({
            success: true,
            bookings,
        });
    } catch (err) {
        console.error('[/api/admin/bookings]', err);
        return NextResponse.json(
            { success: false, message: 'লোড ব্যর্থ', bookings: [] },
            { status: 500 }
        );
    }
}