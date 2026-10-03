import { Customer, Booking } from '@/types';

export interface CreateCustomerInput {
    name: string;
    phone: string;
    address?: string;
    email?: string;
    passwordHash?: string;
}

export interface IDatabaseAdapter {
    ping(): Promise<boolean>;

    findCustomerByPhone(phone: string): Promise<Customer | null>;
    findCustomerByEmail(email: string): Promise<Customer | null>;
    findCustomerById(id: string): Promise<Customer | null>;
    createCustomer(data: CreateCustomerInput): Promise<Customer>;
    updateCustomerLastLogin(id: string): Promise<void>;

    createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking>;
    findBookingsByCustomer(customerId: string): Promise<Booking[]>;
    findBookingById(id: string, customerId: string): Promise<Booking | null>;
}