import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.email !== undefined) updates.email = body.email;
    if (body.category_code !== undefined) updates.categoryCode = body.category_code;
    if (body.hospital_id !== undefined) updates.hospitalId = body.hospital_id || undefined;
    if (body.area !== undefined) updates.area = body.area;
    if (body.address !== undefined) updates.address = body.address;
    if (body.image_url !== undefined) updates.imageUrl = body.image_url;

    const nurse = await db().updateNurse(id, updates, '');
    return NextResponse.json({ success: true, nurse });
  } catch (err: any) {
    console.error('[/api/admin/nurses/:id PATCH]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db().deleteNurse(id, '');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[/api/admin/nurses/:id DELETE]', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
