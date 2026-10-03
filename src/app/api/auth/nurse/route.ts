import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.email?.trim() || !body.password?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Email ও Password দিন' },
                { status: 400 }
            );
        }

        const nurse = await db().getNurseByEmail(body.email);

        if (!nurse) {
            return NextResponse.json(
                { success: false, message: 'Nurse খুঁজে পাওয়া যায়নি' },
                { status: 401 }
            );
        }

        if (!nurse.passwordHash) {
            return NextResponse.json(
                { success: false, message: 'Password সেট করা হয়নি' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(body.password, nurse.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Password ভুল' },
                { status: 401 }
            );
        }

        const { passwordHash, ...safeNurse } = nurse;

        return NextResponse.json({
            success: true,
            nurse: safeNurse,
            source: 'database',
        });
    } catch (err) {
        console.error('[/api/auth/nurse]', err);
        return NextResponse.json(
            { success: false, message: 'সার্ভার সমস্যা' },
            { status: 500 }
        );
    }
}