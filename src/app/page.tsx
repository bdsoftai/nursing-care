'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Nurse } from '@/types';
import QuickBookingModal from '@/components/QuickBookingModal';
import NurseLoginModal from '@/components/NurseLoginModal';
import ThemeToggle from '@/components/ThemeToggle';
import { useCustomer } from '@/context/CustomerContext';
import { useNurse } from '@/context/NurseContext';
import { useAdmin } from '@/context/AdminContext';

export default function HomePage() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedHospital, setSelectedHospital] = useState<string>('All');
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [nurseModalOpen, setNurseModalOpen] = useState(false);

  const { customer } = useCustomer();
  const { nurse: nurseSession } = useNurse();
  const { admin } = useAdmin();

  // ── Load approved nurses from API ──
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/nurses');
        const data = await res.json();
        console.log('📥 Nurses loaded:', data.nurses?.length ?? 0);
        setNurses(data.nurses ?? []);
      } catch (err) {
        console.error('❌ Load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Dynamic filter lists ──
  const areaList = useMemo<string[]>(() => {
    const areas = new Set<string>();
    nurses.forEach((n) => {
      if (n.area && typeof n.area === 'string' && n.area.length > 0) {
        areas.add(n.area);
      }
    });
    return ['All', ...Array.from(areas).sort()];
  }, [nurses]);

  const categoryList = useMemo(() => {
    const cats = new Map<string, string>();
    nurses.forEach((n) => {
      if (n.categoryCode && !cats.has(n.categoryCode)) {
        cats.set(n.categoryCode, n.categoryCode);
      }
    });
    return [
      { value: 'All', label: 'সকল ধরন' },
      ...Array.from(cats.entries()).map(([value, label]) => ({
        value,
        label,
      })),
    ];
  }, [nurses]);

  const hospitalList = useMemo<string[]>(() => {
    const hospitals = new Set<string>();
    nurses.forEach((n) => {
      if (
        n.hospitalId &&
        typeof n.hospitalId === 'string' &&
        n.hospitalId.length > 0
      ) {
        hospitals.add(n.hospitalId);
      }
    });
    return ['All', ...Array.from(hospitals).sort()];
  }, [nurses]);

  // ── Filter logic ──
  const filteredNurses = useMemo(() => {
    return nurses.filter((n) => {
      const areaOk = selectedArea === 'All' || n.area === selectedArea;
      const categoryOk =
        selectedCategory === 'All' || n.categoryCode === selectedCategory;
      const hospitalOk =
        selectedHospital === 'All' || n.hospitalId === selectedHospital;
      return areaOk && categoryOk && hospitalOk;
    });
  }, [nurses, selectedArea, selectedCategory, selectedHospital]);

  const resetFilters = () => {
    setSelectedArea('All');
    setSelectedCategory('All');
    setSelectedHospital('All');
  };

  const hasActiveFilter =
    selectedArea !== 'All' ||
    selectedCategory !== 'All' ||
    selectedHospital !== 'All';

  return (
    <main className="max-w-7xl mx-auto p-4 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 mb-6 bg-blue-50 dark:bg-gray-900 p-4 rounded-xl border border-blue-100 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-blue-900 dark:text-blue-200">
            📋 Nurse Helping Home
          </h1>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            জরুরি প্রয়োজনে সরাসরি নার্স বেছে নিন
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ThemeToggle />

          {/* 1️⃣ Customer Login */}
          {customer ? (
            <Link
              href="/dashboard"
              className="text-xs px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-1 shadow"
            >
              👤 {customer.name.split(' ')[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs px-3 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-950 transition"
            >
              👤 লগইন
            </Link>
          )}

          {/* 2️⃣ Nurse Login — Modal Button */}
          {nurseSession ? (
            <Link
              href="/nurse/dashboard"
              className="text-xs px-3 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition flex items-center gap-1 shadow"
            >
              🧑‍⚕️ {nurseSession.name.split(' ')[0]}
            </Link>
          ) : (
            <button
              onClick={() => setNurseModalOpen(true)}
              className="text-xs px-3 py-2 border border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-500 rounded-lg font-medium hover:bg-teal-50 dark:hover:bg-teal-950 transition"
            >
              🧑‍⚕️ নার্স লগইন
            </button>
          )}

          {/* 3️⃣ Admin Login */}
          {admin ? (
            <Link
              href="/admin/dashboard"
              className="text-xs px-3 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-1 shadow"
            >
              🔐 {admin.name.split(' ')[0]}
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="text-xs px-3 py-2 border border-slate-700 text-slate-700 dark:text-slate-400 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition"
            >
              🔐 অ্যাডমিন
            </Link>
          )}

          {/* Emergency */}
          <a
            href="https://wa.me/8801700000000?text=I%20need%20emergency%20nurse%20service"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1 shadow"
          >
            🚨 ইমার্জেন্সি
          </a>
        </div>
      </header>

      {/* ═══════════════ FILTERS ═══════════════ */}
      <div className="mb-6 space-y-3">
        {/* Area */}
        {areaList.length > 2 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
              📍 এলাকা
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {areaList.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-4 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition ${selectedArea === area
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {area === 'All' ? 'সকল এলাকা' : area}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        {categoryList.length > 2 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
              🏷️ ধরন
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categoryList.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition ${selectedCategory === cat.value
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hospital */}
        {hospitalList.length > 2 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
              🏥 হাসপাতাল
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {hospitalList.map((hospital) => (
                <button
                  key={hospital}
                  onClick={() => setSelectedHospital(hospital)}
                  className={`px-4 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition ${selectedHospital === hospital
                      ? 'bg-teal-600 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {hospital === 'All' ? 'সকল হাসপাতাল' : hospital}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Count + Reset */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            মোট{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {filteredNurses.length}
            </span>{' '}
            জন নার্স পাওয়া গেছে
          </p>
          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              ✖ সব ফিল্টার মুছুন
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════ NURSE GRID ═══════════════ */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredNurses.map((nurse, index) => (
            <div
              key={nurse.id}
              className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white dark:bg-gray-900 flex flex-col justify-between"
            >
              <div>
                <Link
                  href={`/nurse/${nurse.id}`}
                  className="relative block w-full aspect-square bg-gray-100 dark:bg-gray-800 group overflow-hidden"
                >
                  <Image
                    src={
                      nurse.imageUrl ||
                      `https://i.pravatar.cc/150?u=${nurse.id}`
                    }
                    alt={nurse.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    preload={index < 4}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-semibold shadow ${nurse.isAvailable
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      }`}
                  >
                    {nurse.isAvailable ? '● Available' : '● Busy'}
                  </span>
                </Link>

                <div className="p-3 md:p-4">
                  <div className="flex justify-between items-start mb-1.5 gap-1">
                    <Link
                      href={`/nurse/${nurse.id}`}
                      className="font-bold text-gray-800 dark:text-gray-100 text-xs md:text-sm line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      {nurse.name}
                    </Link>
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                      ⭐ {nurse.rating}
                    </span>
                  </div>

                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1.5 line-clamp-1">
                    📍 {nurse.address}
                  </p>

                  <p className="text-[10px] md:text-xs text-purple-600 dark:text-purple-400 font-medium mb-0.5 line-clamp-1">
                    🏷️ {nurse.categoryCode ?? 'N/A'}
                  </p>

                  <p className="text-[10px] md:text-xs text-teal-600 dark:text-teal-400 font-medium mb-3 line-clamp-1">
                    🏥 {nurse.hospitalId ?? 'ফ্রিল্যান্স নার্স'}
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5 px-3 md:px-4 pb-3 md:pb-4">
                <a
                  href={`https://wa.me/88${nurse.phone}?text=Hello%20${encodeURIComponent(
                    nurse.name
                  )},%20I%20got%20your%20profile%20from%20Nurse%20Helping%20Home.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 md:py-2 text-center text-[10px] md:text-xs border border-green-600 text-green-700 dark:text-green-400 dark:border-green-500 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-950 transition"
                >
                  💬 নক
                </a>
                <Link
                  href={`/nurse/${nurse.id}`}
                  className="flex-1 py-1.5 md:py-2 text-center text-[10px] md:text-xs border border-blue-600 text-blue-700 dark:text-blue-400 dark:border-blue-500 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                >
                  👁️ বিস্তারিত
                </Link>
                <button
                  onClick={() => setSelectedNurse(nurse)}
                  className="flex-1 py-1.5 md:py-2 bg-blue-600 text-white text-[10px] md:text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  📋 বুক
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNurses.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm mb-3">
            {nurses.length === 0
              ? 'এখনো কোনো approved নার্স নেই'
              : 'এই ফিল্টারে কোনো নার্স পাওয়া যায়নি'}
          </p>
          {hasActiveFilter ? (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ✖ সব ফিল্টার মুছুন
            </button>
          ) : (
            <p className="text-xs text-gray-400">
              Admin approve করলে নার্স এখানে দেখা যাবে
            </p>
          )}
        </div>
      )}

      {/* ═══════════════ MODALS ═══════════════ */}

      {/* Nurse Login Modal */}
      <NurseLoginModal
        isOpen={nurseModalOpen}
        onClose={() => setNurseModalOpen(false)}
      />

      {/* Booking Modal */}
      <QuickBookingModal
        nurse={selectedNurse}
        onClose={() => setSelectedNurse(null)}
      />
    </main>
  );
}