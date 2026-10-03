// ═══════════════════════════════════════════
// Nurse
// ═══════════════════════════════════════════
export type NurseCategory =
    | 'Hospital-Affiliated'
    | 'Independent'
    | 'Hospital-Exclusive';

export type NurseArea = 'Uttara' | 'Mirpur' | 'Dhanmondi';

export interface Nurse {
    id: string;
    name: string;
    phone: string;
    category: NurseCategory;
    hospitalName?: string;
    rating: number;
    area: NurseArea;
    address: string;
    isAvailable: boolean;
    image: string;
}

// ═══════════════════════════════════════════
// Customer
// ═══════════════════════════════════════════
export interface Customer {
    id: string;
    customerCode: string;             // CUS1001
    name: string;
    phone: string;
    address: string;
    email?: string;                   // optional
    passwordHash?: string;            // server-side only
    emailVerified?: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

export interface CustomerLoginInput {
    name: string;
    phone: string;
    address: string;
    email?: string;                   // optional
    password?: string;                // optional (default = name)
}

// ═══════════════════════════════════════════
// Booking
// ═══════════════════════════════════════════
export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled';

export interface Booking {
    id: string;
    bookingCode?: string;             // BK1001
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

// ═══════════════════════════════════════════
// Quick Booking Modal
// ═══════════════════════════════════════════
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