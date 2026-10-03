import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const nurseId = searchParams.get('nurseId');

        if (!nurseId) {
            return NextResponse.json(
                { success: false, message: 'nurseId প্রয়োজন', bookings: [] },
                { status: 400 }
            );
        }

        const bookings = await db().getNurseBookings(nurseId);

        return NextResponse.json({ success: true, bookings });
    } catch (err) {
        console.error('[/api/nurse/bookings]', err);
        return NextResponse.json(
            { success: false, message: 'লোড ব্যর্থ', bookings: [] },
            { status: 500 }
        );
    }
}