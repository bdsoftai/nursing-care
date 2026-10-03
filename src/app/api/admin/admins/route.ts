import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const passwordHash = await hashPassword(body.password);

        // Auto-generate admin code
        const codePrefix = body.role === 'super_admin' ? 'ADM' : 'OPS';
        const adminCode = await db().generateAdminCode(codePrefix);

        const admin = await db().createAdmin({
            name: body.name,
            email: body.email,
            passwordHash,
            role: body.role,
            adminCode,
        });

        return NextResponse.json({ success: true, admin });
    } catch (err: any) {
        console.error('[/api/admin/admins]', err);
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}