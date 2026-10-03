import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const adminId = 'ADM1001'; // TODO: from session
    const { isActive } = await req.json();

    await db().toggleHospitalActive(id, isActive, adminId);

    return NextResponse.json({ success: true });
}