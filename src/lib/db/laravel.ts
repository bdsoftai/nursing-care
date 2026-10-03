import { Customer, Booking } from '@/types';
import { IDatabaseAdapter, CreateCustomerInput } from './types';

export class LaravelAdapter implements IDatabaseAdapter {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = process.env.LARAVEL_API_URL ?? '';
        this.apiKey = process.env.LARAVEL_API_KEY ?? '';

        if (!this.baseUrl) {
            throw new Error('LARAVEL_API_URL missing in env');
        }
    }

    private async request<T>(path: string, options?: RequestInit): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
                ...options?.headers,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Laravel API error ${res.status}: ${text}`);
        }

        return res.json();
    }

    async ping(): Promise<boolean> {
        try {
            await this.request('/api/ping');
            return true;
        } catch {
            return false;
        }
    }

    // ═══════════════════════════════════════════════
    // Customers
    // ═══════════════════════════════════════════════

    async findCustomerByPhone(phone: string): Promise<Customer | null> {
        try {
            const data = await this.request<{ customer: Customer | null }>(
                `/api/customers/by-phone/${encodeURIComponent(phone)}`
            );
            return data.customer ?? null;
        } catch {
            return null;
        }
    }

    async findCustomerByEmail(email: string): Promise<Customer | null> {
        try {
            const data = await this.request<{ customer: Customer | null }>(
                `/api/customers/by-email/${encodeURIComponent(email)}`
            );
            return data.customer ?? null;
        } catch {
            return null;
        }
    }

    async findCustomerById(id: string): Promise<Customer | null> {
        try {
            const data = await this.request<{ customer: Customer | null }>(
                `/api/customers/${id}`
            );
            return data.customer ?? null;
        } catch {
            return null;
        }
    }

    async createCustomer(input: CreateCustomerInput): Promise<Customer> {
        const data = await this.request<{ customer: Customer }>(
            '/api/customers',
            {
                method: 'POST',
                body: JSON.stringify(input),
            }
        );
        return data.customer;
    }

    async updateCustomerLastLogin(id: string): Promise<void> {
        try {
            await this.request(`/api/customers/${id}/last-login`, {
                method: 'PATCH',
            });
        } catch {
            // silent — non-critical
        }
    }

    // ═══════════════════════════════════════════════
    // Bookings
    // ═══════════════════════════════════════════════

    async createBooking(
        data: Omit<Booking, 'id' | 'createdAt'>
    ): Promise<Booking> {
        const res = await this.request<{ booking: Booking }>('/api/bookings', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res.booking;
    }

    async findBookingsByCustomer(customerId: string): Promise<Booking[]> {
        try {
            const data = await this.request<{ bookings: Booking[] }>(
                `/api/bookings?customer_id=${customerId}`
            );
            return data.bookings ?? [];
        } catch {
            return [];
        }
    }

    async findBookingById(
        id: string,
        customerId: string
    ): Promise<Booking | null> {
        try {
            const data = await this.request<{ booking: Booking | null }>(
                `/api/bookings/${id}?customer_id=${customerId}`
            );
            return data.booking ?? null;
        } catch {
            return null;
        }
    }
}