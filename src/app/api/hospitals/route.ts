import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── GET: List all (including inactive) ───
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeInactive = searchParams.get('all') === 'true';

        const hospitals = await db().getHospitals(includeInactive);
        return NextResponse.json({ success: true, hospitals });
    } catch (err) {
        console.error('[/api/admin/hospitals GET]', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// ─── POST: Create new ───
export async function POST(req: NextRequest) {
    try {
        // TODO: Get admin from session
        const adminId = 'ADM1001'; // temporary

        const body = await req.json();

        if (!body.name?.trim()) {
            return NextResponse.json(
                { success: false, message: 'নাম দিতে হবে' },
                { status: 400 }
            );
        }

        const hospital = await db().createHospital(body, adminId);

        return NextResponse.json({ success: true, hospital });
    } catch (err: any) {
        console.error('[/api/admin/hospitals POST]', err);

        if (err.message?.includes('duplicate')) {
            return NextResponse.json(
                { success: false, message: 'এই নামে হাসপাতাল already আছে' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'সার্ভার সমস্যা' },
            { status: 500 }
        );
    }
}