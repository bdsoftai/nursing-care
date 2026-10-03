import { Customer, Booking, Hospital, HospitalInput, Nurse, Admin } from '@/types';
import {
    IDatabaseAdapter,
    CreateCustomerInput,
    CreateNurseInput,
} from './types';

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
            // silent
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

    // ═══════════════════════════════════════════════
    // Hospitals
    // ═══════════════════════════════════════════════
    async getHospitals(includeInactive = false): Promise<Hospital[]> {
        try {
            const url = includeInactive
                ? '/api/hospitals?all=true'
                : '/api/hospitals';
            const data = await this.request<{ hospitals: Hospital[] }>(url);
            return data.hospitals ?? [];
        } catch {
            return [];
        }
    }

    async getHospitalById(id: string): Promise<Hospital | null> {
        try {
            const data = await this.request<{ hospital: Hospital | null }>(
                `/api/hospitals/${id}`
            );
            return data.hospital ?? null;
        } catch {
            return null;
        }
    }

    async createHospital(
        data: HospitalInput,
        adminId: string
    ): Promise<Hospital> {
        const res = await this.request<{ hospital: Hospital }>('/api/hospitals', {
            method: 'POST',
            body: JSON.stringify({ ...data, adminId }),
        });
        return res.hospital;
    }

    async updateHospital(
        id: string,
        data: Partial<HospitalInput>,
        adminId: string
    ): Promise<Hospital> {
        const res = await this.request<{ hospital: Hospital }>(
            `/api/hospitals/${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ ...data, adminId }),
            }
        );
        return res.hospital;
    }

    async deleteHospital(id: string, adminId: string): Promise<void> {
        await this.request(`/api/hospitals/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ adminId }),
        });
    }

    async toggleHospitalActive(
        id: string,
        isActive: boolean,
        adminId: string
    ): Promise<void> {
        await this.request(`/api/hospitals/${id}/toggle`, {
            method: 'POST',
            body: JSON.stringify({ isActive, adminId }),
        });
    }

    // ═══════════════════════════════════════════════
    // Nurses
    // ═══════════════════════════════════════════════
    async getAllNurses(): Promise<Nurse[]> {
        try {
            const data = await this.request<{ nurses: Nurse[] }>('/api/nurses');
            return data.nurses ?? [];
        } catch {
            return [];
        }
    }

    async getNurseById(id: string): Promise<Nurse | null> {
        try {
            const data = await this.request<{ nurse: Nurse | null }>(
                `/api/nurses/${id}`
            );
            return data.nurse ?? null;
        } catch {
            return null;
        }
    }

    async getNurseByEmail(email: string): Promise<Nurse | null> {
        try {
            const data = await this.request<{ nurse: Nurse | null }>(
                `/api/nurses/by-email/${encodeURIComponent(email)}`
            );
            return data.nurse ?? null;
        } catch {
            return null;
        }
    }

    async createNurse(input: CreateNurseInput): Promise<Nurse> {
        const res = await this.request<{ nurse: Nurse }>('/api/nurses', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return res.nurse;
    }

    async updateNurse(
        id: string,
        data: Partial<Nurse>,
        adminId: string
    ): Promise<Nurse> {
        const res = await this.request<{ nurse: Nurse }>(`/api/nurses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ ...data, adminId }),
        });
        return res.nurse;
    }

    async approveNurse(id: string, adminId: string): Promise<void> {
        await this.request(`/api/nurses/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ adminId }),
        });
    }

    async deleteNurse(id: string, adminId: string): Promise<void> {
        await this.request(`/api/nurses/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({ adminId }),
        });
    }

    // ═══════════════════════════════════════════════
    // Categories
    // ═══════════════════════════════════════════════
    async getCategories(): Promise<any[]> {
        try {
            const data = await this.request<{ categories: any[] }>(
                '/api/categories'
            );
            return data.categories ?? [];
        } catch {
            return [];
        }
    }

  // ═══════════════════════════════════════════
  // Admin — All Data
  // ═══════════════════════════════════════════
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const data = await this.request<{ customers: Customer[] }>('/api/customers');
      return data.customers ?? [];
    } catch { return []; }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      const data = await this.request<{ bookings: Booking[] }>('/api/bookings');
      return data.bookings ?? [];
    } catch { return []; }
  }

  // ═══════════════════════════════════════════
  // Admins
  // ═══════════════════════════════════════════
  async getAdminByEmail(email: string): Promise<Admin | null> {
    try {
      const data = await this.request<{ admin: Admin | null }>(
        `/api/admins/by-email/${encodeURIComponent(email)}`
      );
      return data.admin ?? null;
    } catch { return null; }
  }

  async getAdminById(id: string): Promise<Admin | null> {
    try {
      const data = await this.request<{ admin: Admin | null }>(`/api/admins/${id}`);
      return data.admin ?? null;
    } catch { return null; }
  }
}
