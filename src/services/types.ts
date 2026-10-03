import { Customer, Booking, CustomerLoginInput, QuickBookingInput } from '@/types';

/**
 * Customer Service Contract
 * এই interface follow করে যেকোনো backend (localStorage / Supabase / API) ব্যবহার করা যাবে
 */
export interface ICustomerService {
    loginOrRegister(input: CustomerLoginInput): Promise<{
        success: boolean;
        customer?: Customer;
        message?: string;
    }>;
    getCurrentCustomer(): Customer | null;
    logout(): void;
    getCustomerById(id: string): Customer | null;
}

/**
 * Booking Service Contract
 */
export interface IBookingService {
    submitBooking(payload: QuickBookingInput): Promise<{
        success: boolean;
        bookingId?: string;
        message?: string;
    }>;
    getMyBookings(): Booking[];
    getMyBookingById(id: string): Booking | null;
}