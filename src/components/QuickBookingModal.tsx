'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Nurse, QuickBookingInput } from '@/types';
import { submitQuickBooking } from '@/services/bookingService';
import { getCurrentCustomer, loginOrRegister } from '@/services/customerService';

interface Props {
  nurse: Nurse | null;
  onClose: () => void;
}

export default function QuickBookingModal({ nurse, onClose }: Props) {
  const router = useRouter();

  // 👇 email field added
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [customer, setCustomer] = useState<ReturnType<typeof getCurrentCustomer>>(null);

  // ── Modal opened — check session ──
  useEffect(() => {
    if (!nurse) return;

    const current = getCurrentCustomer();
    console.log('🔍 Modal opened — current customer:', current);

    setCustomer(current);

    if (current) {
      setFormData({
        name: current.name,
        phone: current.phone,
        address: current.address,
        email: current.email ?? '',    // 👈 email from session
      });
      setIsPrefilled(true);
    } else {
      setFormData({ name: '', phone: '', address: '', email: '' });
      setIsPrefilled(false);
    }
  }, [nurse]);

  if (!nurse) return null;

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🚀 === SUBMIT STARTED ===');

    try {
      // ── STEP 1: Login / Register ──
      let current = getCurrentCustomer();
      console.log('🔍 Step 1 — existing customer:', current?.id ?? 'null');

      if (!current) {
        console.log('⚠️ No session — registering new customer...');

        const loginRes = await loginOrRegister({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          email: formData.email || undefined,
        });

        console.log('🔐 Login result:', loginRes);

        // ✅ Type narrowing — check + extract
        if (!loginRes.success || !loginRes.customer) {
          setLoading(false);
          setError(loginRes.message ?? 'লগইন ব্যর্থ');
          return;
        }

        // ✅ TypeScript now knows loginRes.customer is Customer (not null)
        const newCustomer = loginRes.customer;
        current = newCustomer;

        console.log('✅ Step 1 DONE — customer:', newCustomer.id);

        window.dispatchEvent(new Event('customer-updated'));
        console.log('📢 customer-updated event fired');
      } else {
        console.log('✅ Step 1 SKIPPED — already logged in:', current.id);
      }

      // ── STEP 2: Create Booking ──
      const payload: QuickBookingInput = {
        patientName: formData.name,
        patientPhone: formData.phone,
        patientAddress: formData.address,
        nurseId: nurse.id,
        nurseName: nurse.name,
        nurseImage: nurse.image,
        nursePhone: nurse.phone,
      };

      const res = await submitQuickBooking(payload);
      console.log('📥 Step 2 — booking result:', res);

      setLoading(false);

      if (res.success && res.bookingId) {
        console.log('🎉 BOOKING SUCCESSFUL — redirecting to dashboard');
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(res.message ?? 'বুকিং ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error('💥 UNEXPECTED ERROR:', err);
      setLoading(false);
      setError('কিছু ভুল হয়েছে — আবার চেষ্টা করুন');
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden transition-colors max-h-[95vh] overflow-y-auto">
        {!isSuccess ? (
          <div className="grid md:grid-cols-2">
            {/* ─────── LEFT: Nurse Info ─────── */}
            <div className="bg-blue-50 dark:bg-gray-800/60 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-blue-100 dark:border-gray-700">
              <div className="relative mb-4">
                <Image
                  src={nurse.image}
                  alt={nurse.name}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                />
                <span
                  className={`absolute bottom-0 right-0 text-[10px] px-2 py-0.5 rounded-full font-semibold ${nurse.isAvailable
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    }`}
                >
                  {nurse.isAvailable ? '● Available' : '● Busy'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {nurse.name}
              </h3>

              <div className="flex items-center gap-1 mb-3">
                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-0.5 rounded font-semibold">
                  ⭐ {nurse.rating}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">রেটিং</span>
              </div>

              <div className="w-full space-y-2 text-left text-xs">
                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="shrink-0">🏷️</span>
                  <span className="font-medium">
                    {nurse.category}
                    {nurse.hospitalName ? ` (${nurse.hospitalName})` : ''}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="shrink-0">📍</span>
                  <span>{nurse.address}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="shrink-0">📞</span>
                  <span>{nurse.phone}</span>
                </div>
              </div>
            </div>

            {/* ─────── RIGHT: Form ─────── */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                দ্রুত নার্স বুক করুন
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                নিচের তথ্য পূরণ করে বুকিং কনফার্ম করুন
              </p>

              {isPrefilled && customer && (
                <div className="mb-4 p-2.5 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 flex items-start gap-2">
                  <span className="text-sm shrink-0">✅</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-green-700 dark:text-green-300">
                      স্বাগতম, {customer.name}!
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400">
                      তথ্য অটো-ফিল হয়েছে — প্রয়োজনে এডিট করুন
                    </p>
                  </div>
                </div>
              )}

              {!customer && (
                <div className="mb-4 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 flex items-start gap-2">
                  <span className="text-sm shrink-0">ℹ️</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                      প্রথমবার? সমস্যা নেই!
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">
                      তথ্য দিন — স্বয়ংক্রিয়ভাবে অ্যাকাউন্ট তৈরি হবে
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ─── Name ─── */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    আপনার নাম
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="যেমন: রহিম চৌধুরী"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* ─── Phone ─── */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    মোবাইল নম্বর
                  </label>
                  <input
                    required
                    type="tel"
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                {/* ─── Address ─── */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    বর্তমান ঠিকানা
                  </label>
                  <textarea
                    required
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                    placeholder="বাসা নম্বর, রোড, এলাকা"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                {/* ─── Email (Optional) 👈 NEW ─── */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Email{' '}
                    <span className="text-gray-400 text-xs font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    📧 Email দিলে পরে password recovery করতে পারবেন। না দিলে
                    শুধু phone দিয়েই login থাকবে।
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded-lg">
                    ⚠️ {error}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-900 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'প্রসেস হচ্ছে...' : 'বুকিং কনফার্ম'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* ─────── SUCCESS ─────── */
          <div className="text-center py-10 px-6">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
              বুকিং সফল হয়েছে!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <button
                onClick={() => {
                  onClose();
                  router.push('/dashboard');
                }}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                📋 আমার ড্যাশবোর্ড
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push('/');
                }}
                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                🏠 হোমে ফিরুন
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-4">
              ২ সেকেন্ডের মধ্যে স্বয়ংক্রিয়ভাবে ড্যাশবোর্ডে যাবে...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}