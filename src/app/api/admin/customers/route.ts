import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const customers = await db().getAllCustomers();

        console.log(`📊 [/api/admin/customers] Found ${customers.length} customers`);

        return NextResponse.json({
            success: true,
            customers,
        });
    } catch (err) {
        console.error('[/api/admin/customers]', err);
        return NextResponse.json(
            { success: false, message: 'লোড ব্যর্থ', customers: [] },
            { status: 500 }
        );
    }
}