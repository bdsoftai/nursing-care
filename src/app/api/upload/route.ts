import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'misc';

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'ফাইল নেই' },
                { status: 400 }
            );
        }

        // Validate image
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: 'শুধু image আপলোড করুন' },
                { status: 400 }
            );
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: 'সর্বোচ্চ 5MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() ?? 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `${folder}/${filename}`;

        const result = await db().uploadFile('nurses', path, file);

        return NextResponse.json({
            success: true,
            url: result.url,
            path: result.path,
        });
    } catch (err: any) {
        console.error('[/api/upload]', err);
        return NextResponse.json(
            { success: false, message: err.message ?? 'আপলোড ব্যর্থ' },
            { status: 500 }
        );
    }
}