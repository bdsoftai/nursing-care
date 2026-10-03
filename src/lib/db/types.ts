import {
    Customer,
    Booking,
    Hospital,
    HospitalInput,
    Nurse,
    Admin,
} from '@/types';

export interface CreateCustomerInput {
    name: string;
    phone: string;
    address?: string;
    email?: string;
    passwordHash?: string;
}

export interface CreateNurseInput {
    name: string;
    phone: string;
    email: string;
    passwordHash: string;
    categoryCode?: string;
    hospitalId?: string;
    area?: string;
    address?: string;
    imageUrl?: string;
    isApproved?: boolean;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  passwordHash: string;
  role: 'operations_admin' | 'super_admin';
  adminCode: string;
}

export interface IDatabaseAdapter {
    // ... existing

    // ─── Storage ───
    uploadFile(
        bucket: string,
        path: string,
        file: File
    ): Promise<{ url: string; path: string }>;

    deleteFile(bucket: string, path: string): Promise<void>;
}

export interface IDatabaseAdapter {
    // ─── Health ───
    ping(): Promise<boolean>;

    // ─── Customers ───
    findCustomerByPhone(phone: string): Promise<Customer | null>;
    findCustomerByEmail(email: string): Promise<Customer | null>;
    findCustomerById(id: string): Promise<Customer | null>;
    createCustomer(data: CreateCustomerInput): Promise<Customer>;
    updateCustomerLastLogin(id: string): Promise<void>;
    getAllCustomers(): Promise<Customer[]>;

    // ─── Bookings ───
    createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
    findBookingsByCustomer(customerId: string): Promise<Booking[]>;
    findBookingById(id: string, customerId: string): Promise<Booking | null>;
    getAllBookings(): Promise<Booking[]>;

    // ─── Hospitals ───
    getHospitals(includeInactive?: boolean): Promise<Hospital[]>;
    getHospitalById(id: string): Promise<Hospital | null>;
    createHospital(data: HospitalInput, adminId: string): Promise<Hospital>;
    updateHospital(
        id: string,
        data: Partial<HospitalInput>,
        adminId: string
    ): Promise<Hospital>;
    deleteHospital(id: string, adminId: string): Promise<void>;
    toggleHospitalActive(
        id: string,
        isActive: boolean,
        adminId: string
    ): Promise<void>;

    // ─── Nurses ───
    getAllNurses(): Promise<Nurse[]>;
    getNurseById(id: string): Promise<Nurse | null>;
    getNurseByEmail(email: string): Promise<Nurse | null>;
    createNurse(data: CreateNurseInput): Promise<Nurse>;
    updateNurse(
        id: string,
        data: Partial<Nurse>,
        adminId: string
    ): Promise<Nurse>;
    approveNurse(id: string, adminId: string): Promise<void>;
    deleteNurse(id: string, adminId: string): Promise<void>;
  getNurseBookings(nurseId: string): Promise<Booking[]>;

    // ─── Categories ───
    getCategories(): Promise<any[]>;

    // ─── Admins ───
    getAdminByEmail(email: string): Promise<Admin | null>;
    getAdminById(id: string): Promise<Admin | null>;
  createAdmin(data: CreateAdminInput): Promise<Admin>;
  generateAdminCode(prefix: string): Promise<string>;
}