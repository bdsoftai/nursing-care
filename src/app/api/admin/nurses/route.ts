import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ═══════════════════════════════════════════
// GET /api/admin/nurses?filter=pending|approved|all
// ═══════════════════════════════════════════
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') ?? 'all';

        let nurses = await db().getAllNurses();

        if (filter === 'pending') {
            nurses = nurses.filter((n) => !n.isApproved);
        } else if (filter === 'approved') {
            nurses = nurses.filter((n) => n.isApproved);
        }

        return NextResponse.json({ success: true, nurses });
    } catch (err) {
        console.error('[/api/admin/nurses GET]', err);
        return NextResponse.json(
            { success: false, message: 'লোড ব্যর্থ', nurses: [] },
            { status: 500 }
        );
    }
}

// ═══════════════════════════════════════════
// POST /api/admin/nurses — Create new nurse
// ═══════════════════════════════════════════
export async function POST(req: NextRequest) {
    try {
        const adminId = 'ADM1001'; // TODO: from session
        const body = await req.json();

        if (!body.name?.trim() || !body.phone?.trim() || !body.email?.trim()) {
            return NextResponse.json(
                { success: false, message: 'নাম, ফোন, email দিন' },
                { status: 400 }
            );
        }

        const { hashPassword } = await import('@/lib/auth/password');

        const nurse = await db().createNurse({
            name: body.name,
            phone: body.phone,
            email: body.email,
            passwordHash: await hashPassword(body.password ?? body.name),
            categoryCode: body.category_code,
            hospitalId: body.hospital_id,
            area: body.area,
            address: body.address,
            imageUrl: body.image_url,
            isApproved: false,
        });

        return NextResponse.json({ success: true, nurse });
    } catch (err: any) {
        console.error('[/api/admin/nurses POST]', err);
        return NextResponse.json(
            { success: false, message: err.message ?? 'সার্ভার সমস্যা' },
            { status: 500 }
        );
    }
}