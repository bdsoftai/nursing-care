// ═══════════════════════════════════════════
// CUSTOMER
// ═══════════════════════════════════════════
export interface Customer {
    id: string;
    customerCode: string;
    name: string;
    phone: string;
    address: string;
    email?: string;
    passwordHash?: string;
    emailVerified?: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

export interface CustomerLoginInput {
    name: string;
    phone: string;
    address: string;
    email?: string;
    password?: string;
}

// ═══════════════════════════════════════════
// BOOKING
// ═══════════════════════════════════════════
export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled';

export interface Booking {
    id: string;
    bookingCode?: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;

    nurseId: string;
    nurseName: string;
    nurseImage: string;
    nursePhone: string;

    bookingDate: string;
    price: number;
    status: BookingStatus;
    createdAt: string;
}

export interface QuickBookingInput {
    patientName: string;
    patientPhone: string;
    patientAddress: string;
    nurseId: string;
    nurseName: string;
    nurseImage: string;
    nursePhone: string;
}

export interface QuickBookingResponse {
    success: boolean;
    message?: string;
    bookingId?: string;
    data?: Booking;
}

// ═══════════════════════════════════════════
// HOSPITAL
// ═══════════════════════════════════════════
export interface Hospital {
    id: string;
    name: string;
    nameEn?: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface HospitalInput {
    name: string;
    nameEn?: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
}

// ═══════════════════════════════════════════
// NURSE (DB-backed)
// ═══════════════════════════════════════════
export interface Nurse {
    id: string;
    nurseCode: string;
    name: string;
    phone: string;
    email: string;
    passwordHash?: string;
    categoryCode?: string;
    hospitalId?: string;
    hospitalName?: string;
    area?: string;
    address?: string;
    rating: number;
    imageUrl?: string;
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    isAvailable: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

// ═══════════════════════════════════════════
// STATIC NURSE (home page data)
// ═══════════════════════════════════════════
export interface StaticNurse {
    id: string;
    name: string;
    phone: string;
    category: 'Hospital-Affiliated' | 'Independent' | 'Hospital-Exclusive';
    hospitalName?: string;
    rating: number;
    area: 'Uttara' | 'Mirpur' | 'Dhanmondi';
    address: string;
    isAvailable: boolean;
    image: string;
}

// ═══════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════
export type AdminRole = 'operations_admin' | 'super_admin';

export interface Admin {
    id: string;
    adminCode: string;
    name: string;
    email: string;
    passwordHash?: string;
    role: AdminRole;
    createdAt: string;
}

export interface AdminLoginInput {
    email: string;
    password: string;
}
// ═══════════════════════════════════════════
// CATEGORY
// ═══════════════════════════════════════════
export interface Category {
    id: string;
    code: string;
    nameEn: string;
    nameBn: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
}