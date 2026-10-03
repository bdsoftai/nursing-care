import { Customer, CustomerLoginInput } from '@/types';
import { notifyDatabaseSave, notifyError } from '@/components/SaveToast';

const SESSION_KEY = 'nh_session';
const CUSTOMER_DATA_KEY = 'nh_customer_data';

// ─── Session helpers ───
export function getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_KEY);
}

export function saveSession(customer: Customer) {
    if (typeof window === 'undefined') return;
    // Don't store passwordHash in localStorage
    const safeCustomer = { ...customer };
    delete safeCustomer.passwordHash;
    localStorage.setItem(SESSION_KEY, customer.id);
    localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(safeCustomer));
}

export function clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CUSTOMER_DATA_KEY);
}

// ─── Login / Register ───
export async function loginOrRegister(input: CustomerLoginInput) {
    try {
        const res = await fetch('/api/auth/customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        const data = await res.json();

        if (!data.success || !data.customer) {
            notifyError('login', data.message ?? 'লগইন ব্যর্থ');
            return { success: false, message: data.message };
        }

        saveSession(data.customer);
        notifyDatabaseSave('customer', data.customer.name);

        return {
            success: true,
            customer: data.customer,
            mode: data.mode,
        };
    } catch (err) {
        console.error('loginOrRegister error:', err);
        notifyError('login', 'নেটওয়ার্ক সমস্যা');
        return { success: false, message: 'নেটওয়ার্ক সমস্যা' };
    }
}

// ─── Get current customer ───
export function getCurrentCustomer(): Customer | null {
    if (typeof window === 'undefined') return null;

    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;

    const data = localStorage.getItem(CUSTOMER_DATA_KEY);
    if (!data) return null;

    try {
        const customer = JSON.parse(data) as Customer;
        if (customer.id !== id) return null;
        return customer;
    } catch {
        return null;
    }
}

export function logout() {
    clearSession();
}