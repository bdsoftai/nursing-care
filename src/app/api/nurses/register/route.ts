import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validation
        if (!body.name || !body.phone || !body.email || !body.password) {
            return NextResponse.json(
                { success: false, message: 'সব তথ্য দিন' },
                { status: 400 }
            );
        }

        // Check existing
        const existing = await db().getNurseByEmail(body.email);
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'এই email আগেই ব্যবহৃত' },
                { status: 400 }
            );
        }

        // Create nurse (pending)
        const nurse = await db().createNurse({
            name: body.name,
            phone: body.phone,
            email: body.email,
            passwordHash: await hashPassword(body.password),
            categoryCode: body.category_code,
            hospitalId: body.hospital_id,
            area: body.area,
            address: body.address,
            imageUrl: body.image_url,
            isApproved: false,
        });

        return NextResponse.json({ success: true, nurse });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: 'সার্ভার সমস্যা' },
            { status: 500 }
        );
    }
}