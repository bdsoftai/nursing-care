import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { QuickBookingInput } from '@/types';

// ─── POST: Create booking ───
export async function POST(req: NextRequest) {
    try {
        const body: QuickBookingInput & { customerId: string } = await req.json();

        if (!body.customerId) {
            return NextResponse.json(
                { success: false, message: 'লগইন প্রয়োজন' },
                { status: 401 }
            );
        }

        // Verify customer exists
        const customer = await db().findCustomerById(body.customerId);
        if (!customer) {
            return NextResponse.json(
                { success: false, message: 'কাস্টমার পাওয়া যায়নি' },
                { status: 401 }
            );
        }

        const booking = await db().createBooking({
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerAddress: customer.address,
            nurseId: body.nurseId,
            nurseName: body.nurseName,
            nurseImage: body.nurseImage,
            nursePhone: body.nursePhone,
            bookingDate: new Date().toISOString(),
            price: 0,
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            data: booking,
            source: 'database',   // 👈 Toast-এর জন্য
        });
    } catch (err) {
        console.error('[/api/bookings POST]', err);
        return NextResponse.json(
            { success: false, message: 'বুকিং ব্যর্থ হয়েছে' },
            { status: 500 }
        );
    }
}

// ─── GET: Get my bookings ───
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        if (!customerId) {
            return NextResponse.json({ success: false, bookings: [] }, { status: 401 });
        }

        const bookings = await db().findBookingsByCustomer(customerId);

        return NextResponse.json({
            success: true,
            bookings,
            source: 'database',
        });
    } catch (err) {
        console.error('[/api/bookings GET]', err);
        return NextResponse.json(
            { success: false, message: 'লোড ব্যর্থ' },
            { status: 500 }
        );
    }
}