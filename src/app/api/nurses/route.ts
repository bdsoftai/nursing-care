import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const nurses = await db().getAllNurses();

        // ✅ Only approved & active nurses
        const approved = nurses.filter((n) => n.isApproved && n.isActive);

        console.log(`📊 [/api/nurses] Found ${approved.length} approved nurses`);

        return NextResponse.json({
            success: true,
            nurses: approved,
        });
    } catch (err) {
        console.error('[/api/nurses]', err);
        return NextResponse.json(
            { success: false, message: 'লোড ব্যর্থ', nurses: [] },
            { status: 500 }
        );
    }
}