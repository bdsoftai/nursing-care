import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // ─── Validation ───
        if (
            !body.name?.trim() ||
            !body.phone?.trim() ||
            !body.email?.trim() ||
            !body.password?.trim()
        ) {
            return NextResponse.json(
                { success: false, message: 'নাম, ফোন, email এবং password দিন' },
                { status: 400 }
            );
        }

        if (body.phone.trim().length < 11) {
            return NextResponse.json(
                { success: false, message: 'সঠিক ফোন নম্বর দিন' },
                { status: 400 }
            );
        }

        if (body.password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password কমপক্ষে ৬ অক্ষর' },
                { status: 400 }
            );
        }

        // ─── Check existing email ───
        const existing = await db().getNurseByEmail(body.email);
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'এই email আগেই ব্যবহৃত' },
                { status: 400 }
            );
        }

        // ─── Hash password ───
        const passwordHash = await hashPassword(body.password);

        // ─── Create nurse (pending approval) ───
        const nurse = await db().createNurse({
            name: body.name.trim(),
            phone: body.phone.trim(),
            email: body.email.toLowerCase().trim(),
            passwordHash,
            categoryCode: body.category_code ?? undefined,
            hospitalId: body.hospital_id || undefined,
            area: body.area ?? undefined,
            address: body.address ?? undefined,
            imageUrl: body.image_url ?? undefined,
            isApproved: false,       // ⏳ pending
        });

        console.log('✅ Nurse registered:', nurse.nurseCode);

        return NextResponse.json({
            success: true,
            nurse,
            message: 'রেজিস্ট্রেশন সফল — Admin approval এর অপেক্ষা করুন',
        });
    } catch (err: any) {
        console.error('[/api/nurses/register]', err);
        return NextResponse.json(
            {
                success: false,
                message: err.message ?? 'সার্ভার সমস্যা',
            },
            { status: 500 }
        );
    }
}