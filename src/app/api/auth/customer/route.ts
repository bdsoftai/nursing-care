import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { CustomerLoginInput } from '@/types';

export async function POST(req: NextRequest) {
    try {
        const body: CustomerLoginInput = await req.json();

        // ─── Validation ───
        if (!body.name?.trim() || !body.phone?.trim() || !body.address?.trim()) {
            return NextResponse.json(
                { success: false, message: 'সব তথ্য দিন' },
                { status: 400 }
            );
        }

        if (body.phone.trim().length < 11) {
            return NextResponse.json(
                { success: false, message: 'সঠিক ফোন নম্বর দিন' },
                { status: 400 }
            );
        }

        const hasEmail = !!(body.email?.trim() && body.email.includes('@'));

        // ═══════════════════════════════════════════
        // MODE 1: Email Login (Email + Password)
        // ═══════════════════════════════════════════
        if (hasEmail) {
            const email = body.email!.trim().toLowerCase();
            const password = body.password?.trim() || body.name.trim();

            let customer = await db().findCustomerByEmail(email);

            if (!customer) {
                // New customer with email
                customer = await db().createCustomer({
                    name: body.name.trim(),
                    phone: body.phone.trim(),
                    address: body.address.trim(),
                    email,
                    passwordHash: await hashPassword(password),
                });

                return NextResponse.json({
                    success: true,
                    customer,
                    source: 'database',
                    mode: 'email-register',
                });
            }

            // Existing — verify password
            if (!customer.passwordHash) {
                return NextResponse.json(
                    { success: false, message: 'এই email-এ পাসওয়ার্ড সেট করা হয়নি' },
                    { status: 401 }
                );
            }

            const isValid = await verifyPassword(password, customer.passwordHash);
            if (!isValid) {
                return NextResponse.json(
                    { success: false, message: 'পাসওয়ার্ড ভুল' },
                    { status: 401 }
                );
            }

            await db().updateCustomerLastLogin(customer.id);

            return NextResponse.json({
                success: true,
                customer,
                source: 'database',
                mode: 'email-login',
            });
        }

        // ═══════════════════════════════════════════
        // MODE 2: Phone-Only Login (Silent)
        // ═══════════════════════════════════════════
        let customer = await db().findCustomerByPhone(body.phone.trim());

        if (!customer) {
            customer = await db().createCustomer({
                name: body.name.trim(),
                phone: body.phone.trim(),
                address: body.address.trim(),
            });

            return NextResponse.json({
                success: true,
                customer,
                source: 'database',
                mode: 'phone-register',
            });
        }

        await db().updateCustomerLastLogin(customer.id);

        return NextResponse.json({
            success: true,
            customer,
            source: 'database',
            mode: 'phone-login',
        });
    } catch (err) {
        console.error('[/api/auth/customer]', err);
        return NextResponse.json(
            { success: false, message: 'সার্ভার সমস্যা' },
            { status: 500 }
        );
    }
}