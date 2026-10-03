import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Customer, Booking } from '@/types';
import { IDatabaseAdapter, CreateCustomerInput } from './types';

// ─────────────────────────────────────────────
// Supabase Client (Server-side only)
// ─────────────────────────────────────────────
function getSupabase(): SupabaseClient {
    const rawUrl = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!rawUrl || !key) {
        throw new Error('Supabase environment variables missing. Check .env.local');
    }

    // 🧹 URL sanitize
    let url = rawUrl.trim();
    url = url.replace(/\/rest\/v1\/?$/, '');
    url = url.replace(/\/dashboard.*$/, '');
    url = url.replace(/\/+$/, '');
    url = url.replace(/^http:\/\//, 'https://');

    console.log('🔍 Supabase URL (cleaned):', url);

    return createClient(url, key, {
        auth: { persistSession: false },
    });
}

// ─────────────────────────────────────────────
// Row types
// ─────────────────────────────────────────────
interface CustomerRow {
    id: string;
    customer_code: string | null;
    name: string;
    phone: string;
    address: string | null;
    email: string | null;
    password_hash: string | null;
    email_verified: boolean | null;
    created_at: string;
    last_login_at: string | null;
    updated_at: string | null;
}

interface BookingRow {
    id: string;
    booking_code: string | null;
    customer_id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    nurse_id: string;
    nurse_name: string | null;
    nurse_image: string | null;
    nurse_phone: string | null;
    booking_date: string | null;
    status: string;
    price: number | null;
    assigned_by: string | null;
    assigned_at: string | null;
    approved_by: string | null;
    completed_at: string | null;
    created_at: string;
}

// ─────────────────────────────────────────────
// Supabase Adapter
// ─────────────────────────────────────────────
export class SupabaseAdapter implements IDatabaseAdapter {
    private client: SupabaseClient;

    constructor() {
        this.client = getSupabase();
    }

    // ═══════════════════════════════════════════
    // Health Check
    // ═══════════════════════════════════════════
    async ping(): Promise<boolean> {
        try {
            const { error } = await this.client
                .from('customers')
                .select('id')
                .limit(1);
            return !error;
        } catch {
            return false;
        }
    }

    // ═══════════════════════════════════════════
    // Customers
    // ═══════════════════════════════════════════

    async findCustomerByPhone(phone: string): Promise<Customer | null> {
        const { data, error } = await this.client
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapCustomerRow(data as CustomerRow);
    }

    async findCustomerByEmail(email: string): Promise<Customer | null> {
        const { data, error } = await this.client
            .from('customers')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (error || !data) return null;
        return this.mapCustomerRow(data as CustomerRow);
    }

    async findCustomerById(id: string): Promise<Customer | null> {
        const { data, error } = await this.client
            .from('customers')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapCustomerRow(data as CustomerRow);
    }

    async createCustomer(input: CreateCustomerInput): Promise<Customer> {
        // Generate customer code
        const customerCode = await this.generateCustomerCode();

        const { data, error } = await this.client
            .from('customers')
            .insert({
                customer_code: customerCode,
                name: input.name.trim(),
                phone: input.phone.trim(),
                address: input.address?.trim() ?? null,
                email: input.email?.toLowerCase().trim() ?? null,
                password_hash: input.passwordHash ?? null,
                email_verified: false,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapCustomerRow(data as CustomerRow);
    }

    async updateCustomerLastLogin(id: string): Promise<void> {
        await this.client
            .from('customers')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', id);
    }

    // ═══════════════════════════════════════════
    // Bookings
    // ═══════════════════════════════════════════

    async createBooking(
        data: Omit<Booking, 'id' | 'createdAt'>
    ): Promise<Booking> {
        const bookingCode = await this.generateBookingCode();

        const { data: row, error } = await this.client
            .from('bookings')
            .insert({
                booking_code: bookingCode,
                customer_id: data.customerId,
                customer_name: data.customerName,
                customer_phone: data.customerPhone,
                customer_address: data.customerAddress,
                nurse_id: data.nurseId,
                nurse_name: data.nurseName,
                nurse_image: data.nurseImage,
                nurse_phone: data.nursePhone,
                status: data.status,
                price: data.price,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapBookingRow(row as BookingRow);
    }

    async findBookingsByCustomer(customerId: string): Promise<Booking[]> {
        const { data, error } = await this.client
            .from('bookings')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return (data as BookingRow[]).map((row) => this.mapBookingRow(row));
    }

    async findBookingById(
        id: string,
        customerId: string
    ): Promise<Booking | null> {
        const { data, error } = await this.client
            .from('bookings')
            .select('*')
            .eq('id', id)
            .eq('customer_id', customerId)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapBookingRow(data as BookingRow);
    }

    // ═══════════════════════════════════════════
    // Private helpers
    // ═══════════════════════════════════════════

    private async generateCustomerCode(): Promise<string> {
        const { data } = await this.client
            .from('customers')
            .select('customer_code')
            .not('customer_code', 'is', null)
            .order('customer_code', { ascending: false })
            .limit(1);

        const lastCode = data?.[0]?.customer_code ?? 'CUS1000';
        const num = parseInt(lastCode.replace('CUS', ''), 10) + 1;
        return `CUS${num}`;
    }

    private async generateBookingCode(): Promise<string> {
        const { data } = await this.client
            .from('bookings')
            .select('booking_code')
            .not('booking_code', 'is', null)
            .order('booking_code', { ascending: false })
            .limit(1);

        const lastCode = data?.[0]?.booking_code ?? 'BK1000';
        const num = parseInt(lastCode.replace('BK', ''), 10) + 1;
        return `BK${num}`;
    }

    private mapCustomerRow(row: CustomerRow): Customer {
        return {
            id: row.id,
            customerCode: row.customer_code ?? '',
            name: row.name,
            phone: row.phone,
            address: row.address ?? '',
            email: row.email ?? undefined,
            passwordHash: row.password_hash ?? undefined,
            emailVerified: row.email_verified ?? false,
            createdAt: row.created_at,
            lastLoginAt: row.last_login_at ?? undefined,
        };
    }

    private mapBookingRow(row: BookingRow): Booking {
        return {
            id: row.id,
            bookingCode: row.booking_code ?? undefined,
            customerId: row.customer_id,
            customerName: row.customer_name ?? '',
            customerPhone: row.customer_phone ?? '',
            customerAddress: row.customer_address ?? '',
            nurseId: row.nurse_id,
            nurseName: row.nurse_name ?? '',
            nurseImage: row.nurse_image ?? '',
            nursePhone: row.nurse_phone ?? '',
            bookingDate: row.booking_date ?? row.created_at,
            price: row.price ?? 0,
            status: row.status as Booking['status'],
            createdAt: row.created_at,
        };
    }
}