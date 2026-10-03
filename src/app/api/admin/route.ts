import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.email?.trim() || !body.password?.trim() || !body.adminCode?.trim()) {
            return NextResponse.json(
                { success: false, message: 'Email, Password এবং Admin Code দিন' },
                { status: 400 }
            );
        }

        // 1️⃣ Find admin by email
        const admin = await db().getAdminByEmail(body.email);

        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Admin খুঁজে পাওয়া যায়নি' },
                { status: 401 }
            );
        }

        // 2️⃣ Check admin_code FIRST
        if (admin.adminCode !== body.adminCode.trim().toUpperCase()) {
            return NextResponse.json(
                { success: false, message: 'Admin Code ভুল' },
                { status: 401 }
            );
        }

        // 3️⃣ Verify password
        if (!admin.passwordHash) {
            return NextResponse.json(
                { success: false, message: 'Password সেট করা হয়নি' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(body.password, admin.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Password ভুল' },
                { status: 401 }
            );
        }

        const { passwordHash, ...safeAdmin } = admin;

        return NextResponse.json({
            success: true,
            admin: safeAdmin,
            source: 'database',
        });
    } catch (err) {
        console.error('[/api/auth/admin]', err);
        return NextResponse.json(
            { success: false, message: 'সার্ভার সমস্যা' },
            { status: 500 }
        );
    }
}