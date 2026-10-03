import { MongoClient, Db, ObjectId } from 'mongodb';
import { Customer, Booking, Hospital, HospitalInput, Nurse, Admin } from '@/types';
import {
  IDatabaseAdapter,
  CreateCustomerInput,
  CreateNurseInput,
} from './types';

interface CustomerDoc {
  _id?: ObjectId;
  customerCode: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface BookingDoc {
  _id?: ObjectId;
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
  status: string;
  createdAt: string;
}

export class MongoAdapter implements IDatabaseAdapter {
  private client: MongoClient;
  private dbName: string;
  private cachedDb: Db | null = null;

  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI missing in env');
    this.client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    this.dbName = process.env.MONGODB_DB ?? 'nurse_helping_home';
  }

  private async db(): Promise<Db> {
    if (this.cachedDb) return this.cachedDb;
    await this.client.connect();
    this.cachedDb = this.client.db(this.dbName);
    return this.cachedDb;
  }

  async ping(): Promise<boolean> {
    try { const db = await this.db(); await db.command({ ping: 1 }); return true; }
    catch { return false; }
  }

  // ─── Customers ───
  async findCustomerByPhone(phone: string): Promise<Customer | null> {
    try {
      const db = await this.db();
      const doc = await db.collection<CustomerDoc>('customers').findOne({ phone });
      return doc ? this.mapCustomer(doc) : null;
    } catch { return null; }
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const db = await this.db();
      const doc = await db.collection<CustomerDoc>('customers').findOne({ email: email.toLowerCase().trim() });
      return doc ? this.mapCustomer(doc) : null;
    } catch { return null; }
  }

  async findCustomerById(id: string): Promise<Customer | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const db = await this.db();
      const doc = await db.collection<CustomerDoc>('customers').findOne({ _id: new ObjectId(id) });
      return doc ? this.mapCustomer(doc) : null;
    } catch { return null; }
  }

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const db = await this.db();
    const customerCode = await this.generateCustomerCode();
    const doc: CustomerDoc = {
      customerCode,
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address?.trim(),
      email: input.email?.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection<CustomerDoc>('customers').insertOne(doc);
    return { id: result.insertedId.toString(), customerCode: doc.customerCode, name: doc.name, phone: doc.phone, address: doc.address ?? '', email: doc.email, emailVerified: false, createdAt: doc.createdAt };
  }

  async updateCustomerLastLogin(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const db = await this.db();
    await db.collection<CustomerDoc>('customers').updateOne({ _id: new ObjectId(id) }, { $set: { lastLoginAt: new Date().toISOString() } });
  }

  // ─── Bookings ───
  async createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const db = await this.db();
    const bookingCode = await this.generateBookingCode();
    const doc: BookingDoc = { bookingCode, customerId: data.customerId, customerName: data.customerName, customerPhone: data.customerPhone, customerAddress: data.customerAddress, nurseId: data.nurseId, nurseName: data.nurseName, nurseImage: data.nurseImage, nursePhone: data.nursePhone, bookingDate: data.bookingDate, price: data.price, status: data.status, createdAt: new Date().toISOString() };
    const result = await db.collection<BookingDoc>('bookings').insertOne(doc);
    return { id: result.insertedId.toString(), bookingCode: doc.bookingCode, customerId: doc.customerId, customerName: doc.customerName, customerPhone: doc.customerPhone, customerAddress: doc.customerAddress, nurseId: doc.nurseId, nurseName: doc.nurseName, nurseImage: doc.nurseImage, nursePhone: doc.nursePhone, bookingDate: doc.bookingDate, price: doc.price, status: doc.status as Booking['status'], createdAt: doc.createdAt };
  }

  async findBookingsByCustomer(customerId: string): Promise<Booking[]> {
    try {
      const db = await this.db();
      const docs = await db.collection<BookingDoc>('bookings').find({ customerId }).sort({ createdAt: -1 }).toArray();
      return docs.map((doc) => this.mapBooking(doc));
    } catch { return []; }
  }

  async findBookingById(id: string, customerId: string): Promise<Booking | null> {
    try {
      if (!ObjectId.isValid(id)) return null;
      const db = await this.db();
      const doc = await db.collection<BookingDoc>('bookings').findOne({ _id: new ObjectId(id), customerId });
      return doc ? this.mapBooking(doc) : null;
    } catch { return null; }
  }

  // ─── Hospitals (stubs) ───
  async getHospitals(includeInactive = false): Promise<Hospital[]> { return []; }
  async getHospitalById(id: string): Promise<Hospital | null> { return null; }
  async createHospital(data: HospitalInput, adminId: string): Promise<Hospital> { throw new Error('Not implemented'); }
  async updateHospital(id: string, data: Partial<HospitalInput>, adminId: string): Promise<Hospital> { throw new Error('Not implemented'); }
  async deleteHospital(id: string, adminId: string): Promise<void> { throw new Error('Not implemented'); }
  async toggleHospitalActive(id: string, isActive: boolean, adminId: string): Promise<void> { throw new Error('Not implemented'); }

  // ─── Nurses (stubs) ───
  async getAllNurses(): Promise<Nurse[]> { return []; }
  async getNurseById(id: string): Promise<Nurse | null> { return null; }
  async getNurseByEmail(email: string): Promise<Nurse | null> { return null; }
  async createNurse(input: CreateNurseInput): Promise<Nurse> { throw new Error('Not implemented'); }
  async updateNurse(id: string, data: Partial<Nurse>, adminId: string): Promise<Nurse> { throw new Error('Not implemented'); }
  async approveNurse(id: string, adminId: string): Promise<void> { throw new Error('Not implemented'); }
  async deleteNurse(id: string, adminId: string): Promise<void> { throw new Error('Not implemented'); }

  // ─── Categories ───
  async getCategories(): Promise<any[]> { return []; }

  // ─── Helpers ───
  private async generateCustomerCode(): Promise<string> {
    const db = await this.db();
    const last = await db.collection<CustomerDoc>('customers').find({ customerCode: { $exists: true } }).sort({ customerCode: -1 }).limit(1).toArray();
    const lastCode = last[0]?.customerCode ?? 'CUS1000';
    return `CUS${parseInt(lastCode.replace('CUS', ''), 10) + 1}`;
  }

  private async generateBookingCode(): Promise<string> {
    const db = await this.db();
    const last = await db.collection<BookingDoc>('bookings').find({ bookingCode: { $exists: true } }).sort({ bookingCode: -1 }).limit(1).toArray();
    const lastCode = last[0]?.bookingCode ?? 'BK1000';
    return `BK${parseInt(lastCode.replace('BK', ''), 10) + 1}`;
  }

  private mapCustomer(doc: CustomerDoc): Customer {
    return { id: doc._id!.toString(), customerCode: doc.customerCode, name: doc.name, phone: doc.phone, address: doc.address ?? '', email: doc.email, emailVerified: doc.emailVerified ?? false, createdAt: doc.createdAt, lastLoginAt: doc.lastLoginAt };
  }

  private mapBooking(doc: BookingDoc): Booking {
    return { id: doc._id!.toString(), bookingCode: doc.bookingCode, customerId: doc.customerId, customerName: doc.customerName, customerPhone: doc.customerPhone, customerAddress: doc.customerAddress, nurseId: doc.nurseId, nurseName: doc.nurseName, nurseImage: doc.nurseImage, nursePhone: doc.nursePhone, bookingDate: doc.bookingDate, price: doc.price, status: doc.status as Booking['status'], createdAt: doc.createdAt };
  }

  // ═══════════════════════════════════════════
  // Admin — All Data (stubs)
  // ═══════════════════════════════════════════
  async getAllCustomers(): Promise<Customer[]> { return []; }
  async getAllBookings(): Promise<Booking[]> { return []; }

  // ═══════════════════════════════════════════
  // Admins (stubs)
  // ═══════════════════════════════════════════
  async getAdminByEmail(email: string): Promise<Admin | null> { return null; }
  async getAdminById(id: string): Promise<Admin | null> { return null; }
}
