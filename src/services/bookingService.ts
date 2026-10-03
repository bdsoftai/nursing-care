import { Booking, QuickBookingInput } from '@/types';
import { getSessionId, getCurrentCustomer } from './customerService';
import { notifyDatabaseSave, notifyError } from '@/components/SaveToast';

export async function submitQuickBooking(payload: QuickBookingInput) {
    const customerId = getSessionId();
    if (!customerId) {
        return { success: false, message: 'লগইন প্রয়োজন' };
    }

    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, customerId }),
        });

        const data = await res.json();

        if (!data.success) {
            notifyError('booking', data.message ?? 'বুকিং ব্যর্থ');
            return { success: false, message: data.message };
        }

        // 🍞 Toast
        notifyDatabaseSave('booking', payload.nurseName);
        console.log('☁️ Booking saved to database:', data.bookingId);

        return { success: true, bookingId: data.bookingId, data: data.data };
    } catch (err) {
        console.error('submitQuickBooking error:', err);
        notifyError('booking', 'নেটওয়ার্ক সমস্যা');
        return { success: false, message: 'নেটওয়ার্ক সমস্যা' };
    }
}

export async function fetchMyBookings(): Promise<Booking[]> {
    const customerId = getSessionId();
    if (!customerId) return [];

    try {
        const res = await fetch(`/api/bookings?customerId=${customerId}`);
        const data = await res.json();
        return data.success ? data.bookings : [];
    } catch {
        return [];
    }
}

export async function fetchBookingById(id: string): Promise<Booking | null> {
    const customerId = getSessionId();
    if (!customerId) return null;

    try {
        const res = await fetch(`/api/bookings/${id}?customerId=${customerId}`);
        const data = await res.json();
        return data.success ? data.booking : null;
    } catch {
        return null;
    }
}