import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Customer, Booking, Hospital, HospitalInput, Nurse, Admin } from '@/types';
import {
    IDatabaseAdapter,
    CreateCustomerInput,
    CreateNurseInput,
    CreateAdminInput,
} from './types';

// ─────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────
function getSupabase(): SupabaseClient {
    const rawUrl = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!rawUrl || !key) {
        throw new Error('Supabase environment variables missing. Check .env.local');
    }

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
interface AdminRow {
    id: string;
    admin_code: string;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    created_at: string;
}

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

interface HospitalRow {
    id: string;
    name: string;
    name_en: string | null;
    location: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_at: string;
    updated_at: string;
}

interface NurseRow {
    id: string;
    nurse_code: string;
    name: string;
    phone: string;
    email: string;
    password_hash: string | null;
    category_code: string | null;
    hospital_id: string | null;
    area: string | null;
    address: string | null;
    rating: number | null;
    image_url: string | null;
    is_approved: boolean;
    approved_by: string | null;
    approved_at: string | null;
    is_available: boolean;
    is_active: boolean | null;
    created_at: string;
    updated_at: string | null;
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

    async getAllCustomers(): Promise<Customer[]> {
        const { data, error } = await this.client
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return (data as CustomerRow[]).map((row) => this.mapCustomerRow(row));
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

    async getAllBookings(): Promise<Booking[]> {
        const { data, error } = await this.client
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return (data as BookingRow[]).map((row) => this.mapBookingRow(row));
    }

    async getNurseBookings(nurseId: string): Promise<Booking[]> {
        const { data, error } = await this.client
            .from('bookings')
            .select('*')
            .eq('nurse_id', nurseId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return (data as BookingRow[]).map((row) => this.mapBookingRow(row));
    }

    // ═══════════════════════════════════════════
    // Hospitals
    // ═══════════════════════════════════════════
    async getHospitals(includeInactive = false): Promise<Hospital[]> {
        let query = this.client.from('hospitals').select('*');

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('name');

        if (error || !data) return [];
        return (data as HospitalRow[]).map((row) => this.mapHospitalRow(row));
    }

    async getHospitalById(id: string): Promise<Hospital | null> {
        const { data, error } = await this.client
            .from('hospitals')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapHospitalRow(data as HospitalRow);
    }

    async createHospital(
        data: HospitalInput,
        adminId: string
    ): Promise<Hospital> {
        const { data: row, error } = await this.client
            .from('hospitals')
            .insert({
                name: data.name.trim(),
                name_en: data.nameEn?.trim() ?? null,
                location: data.location?.trim() ?? null,
                address: data.address?.trim() ?? null,
                phone: data.phone?.trim() ?? null,
                email: data.email?.trim() ?? null,
                website: data.website?.trim() ?? null,
                is_active: true,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapHospitalRow(row as HospitalRow);
    }

    async updateHospital(
        id: string,
        data: Partial<HospitalInput>,
        adminId: string
    ): Promise<Hospital> {
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.nameEn !== undefined)
            updateData.name_en = data.nameEn?.trim() ?? null;
        if (data.location !== undefined)
            updateData.location = data.location?.trim() ?? null;
        if (data.address !== undefined)
            updateData.address = data.address?.trim() ?? null;
        if (data.phone !== undefined) updateData.phone = data.phone?.trim() ?? null;
        if (data.email !== undefined) updateData.email = data.email?.trim() ?? null;
        if (data.website !== undefined)
            updateData.website = data.website?.trim() ?? null;

        const { data: row, error } = await this.client
            .from('hospitals')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapHospitalRow(row as HospitalRow);
    }

    async deleteHospital(id: string, adminId: string): Promise<void> {
        const { error } = await this.client
            .from('hospitals')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    async toggleHospitalActive(
        id: string,
        isActive: boolean,
        adminId: string
    ): Promise<void> {
        const { error } = await this.client
            .from('hospitals')
            .update({
                is_active: isActive,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    // ═══════════════════════════════════════════
    // Nurses
    // ═══════════════════════════════════════════
    async getAllNurses(): Promise<Nurse[]> {
        const { data, error } = await this.client
            .from('nurses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return (data as NurseRow[]).map((row) => this.mapNurseRow(row));
    }

    async getNurseById(id: string): Promise<Nurse | null> {
        const { data, error } = await this.client
            .from('nurses')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapNurseRow(data as NurseRow);
    }

    async getNurseByEmail(email: string): Promise<Nurse | null> {
        const { data, error } = await this.client
            .from('nurses')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (error || !data) return null;
        return this.mapNurseRow(data as NurseRow);
    }

    async createNurse(input: CreateNurseInput): Promise<Nurse> {
        const nurseCode = await this.generateNurseCode();

        const { data: row, error } = await this.client
            .from('nurses')
            .insert({
                nurse_code: nurseCode,
                name: input.name.trim(),
                phone: input.phone.trim(),
                email: input.email.toLowerCase().trim(),
                password_hash: input.passwordHash,
                category_code: input.categoryCode ?? null,
                hospital_id: input.hospitalId || null,
                area: input.area ?? null,
                address: input.address ?? null,
                image_url: input.imageUrl ?? null,
                is_approved: input.isApproved ?? false,
                is_available: true,
                is_active: true,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapNurseRow(row as NurseRow);
    }

    async updateNurse(
        id: string,
        data: Partial<Nurse>,
        adminId: string
    ): Promise<Nurse> {
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.phone !== undefined) updateData.phone = data.phone.trim();
        if (data.email !== undefined)
            updateData.email = data.email.toLowerCase().trim();
        if (data.categoryCode !== undefined)
            updateData.category_code = data.categoryCode;
        if (data.hospitalId !== undefined)
            updateData.hospital_id = data.hospitalId || null;
        if (data.area !== undefined) updateData.area = data.area;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.rating !== undefined) updateData.rating = data.rating;
        if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
        if (data.isApproved !== undefined) {
            updateData.is_approved = data.isApproved;
            if (data.isApproved) {
                updateData.approved_at = new Date().toISOString();
            }
        }
        if (data.isAvailable !== undefined)
            updateData.is_available = data.isAvailable;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;

        const { data: row, error } = await this.client
            .from('nurses')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapNurseRow(row as NurseRow);
    }

    async approveNurse(id: string, adminId: string): Promise<void> {
        const { error } = await this.client
            .from('nurses')
            .update({
                is_approved: true,
                approved_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    async deleteNurse(id: string, adminId: string): Promise<void> {
        const { error } = await this.client
            .from('nurses')
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    // ═══════════════════════════════════════════
    // Categories
    // ═══════════════════════════════════════════
    async getCategories(): Promise<any[]> {
        const { data, error } = await this.client
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error || !data) return [];
        return data;
    }

    // ═══════════════════════════════════════════
    // Admins
    // ═══════════════════════════════════════════
    async getAdminByEmail(email: string): Promise<Admin | null> {
        const { data, error } = await this.client
            .from('admins')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (error || !data) return null;
        return this.mapAdminRow(data as AdminRow);
    }

    async getAdminById(id: string): Promise<Admin | null> {
        const { data, error } = await this.client
            .from('admins')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error || !data) return null;
        return this.mapAdminRow(data as AdminRow);
    }

    async createAdmin(data: CreateAdminInput): Promise<Admin> {
        const { data: row, error } = await this.client
            .from('admins')
            .insert({
                admin_code: data.adminCode.toUpperCase().trim(),
                name: data.name.trim(),
                email: data.email.toLowerCase().trim(),
                password_hash: data.passwordHash,
                role: data.role,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapAdminRow(row as AdminRow);
    }

    async generateAdminCode(prefix: string): Promise<string> {
        const { data } = await this.client
            .from('admins')
            .select('admin_code')
            .like('admin_code', `${prefix}%`)
            .order('admin_code', { ascending: false })
            .limit(1);

        const lastCode = data?.[0]?.admin_code ?? `${prefix}1000`;
        const num = parseInt(lastCode.replace(prefix, ''), 10) + 1;
        return `${prefix}${num}`;
    }

    // ═══════════════════════════════════════════
    // Storage (File Upload)
    // ═══════════════════════════════════════════
    async uploadFile(
        bucket: string,
        path: string,
        file: File
    ): Promise<{ url: string; path: string }> {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await this.client.storage
            .from(bucket)
            .upload(path, buffer, {
                contentType: file.type,
                upsert: true,
                cacheControl: '3600',
            });

        if (error) throw new Error(error.message);

        const { data: urlData } = this.client.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            url: urlData.publicUrl,
            path: data.path,
        };
    }

    async deleteFile(bucket: string, path: string): Promise<void> {
        const { error } = await this.client.storage.from(bucket).remove([path]);
        if (error) throw new Error(error.message);
    }

    // ═══════════════════════════════════════════
    // Private helpers — Code generators
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

    private async generateNurseCode(): Promise<string> {
        const { data } = await this.client
            .from('nurses')
            .select('nurse_code')
            .not('nurse_code', 'is', null)
            .order('nurse_code', { ascending: false })
            .limit(1);

        const lastCode = data?.[0]?.nurse_code ?? 'NUR1000';
        const num = parseInt(lastCode.replace('NUR', ''), 10) + 1;
        return `NUR${num}`;
    }

    // ═══════════════════════════════════════════
    // Public client getter (for direct queries)
    // ═══════════════════════════════════════════
    getClient(): SupabaseClient {
        return this.client;
    }

    // ═══════════════════════════════════════════
    // Update booking status
    // ═══════════════════════════════════════════
    async updateBookingStatus(id: string, status: string): Promise<void> {
        const { error } = await this.client
            .from('bookings')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    // ═══════════════════════════════════════════
    // Private helpers — Row mappers
    // ═══════════════════════════════════════════
    private mapAdminRow(row: AdminRow): Admin {
        return {
            id: row.id,
            adminCode: row.admin_code,
            name: row.name,
            email: row.email,
            passwordHash: row.password_hash,
            role: row.role as Admin['role'],
            createdAt: row.created_at,
        };
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

    private mapHospitalRow(row: HospitalRow): Hospital {
        return {
            id: row.id,
            name: row.name,
            nameEn: row.name_en ?? undefined,
            location: row.location ?? undefined,
            address: row.address ?? undefined,
            phone: row.phone ?? undefined,
            email: row.email ?? undefined,
            website: row.website ?? undefined,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    private mapNurseRow(row: NurseRow): Nurse {
        return {
            id: row.id,
            nurseCode: row.nurse_code,
            name: row.name,
            phone: row.phone,
            email: row.email,
            passwordHash: row.password_hash ?? undefined,
            categoryCode: row.category_code ?? undefined,
            hospitalId: row.hospital_id ?? undefined,
            area: row.area ?? undefined,
            address: row.address ?? undefined,
            rating: row.rating ?? 0,
            imageUrl: row.image_url ?? undefined,
            isApproved: row.is_approved,
            approvedBy: row.approved_by ?? undefined,
            approvedAt: row.approved_at ?? undefined,
            isAvailable: row.is_available,
            isActive: row.is_active ?? true,
            createdAt: row.created_at,
            updatedAt: row.updated_at ?? undefined,
        };
    }
}