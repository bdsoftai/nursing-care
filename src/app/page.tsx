'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { STATIC_NURSES, getAllHospitals, CATEGORY_META } from '@/data/nurses';
import { StaticNurse } from '@/types';
import QuickBookingModal from '@/components/QuickBookingModal';
import ThemeToggle from '@/components/ThemeToggle';
import { useCustomer } from '@/context/CustomerContext';

export default function HomePage() {
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedHospital, setSelectedHospital] = useState<string>('All');
  const [selectedNurse, setSelectedNurse] = useState<StaticNurse | null>(null);

  const { customer } = useCustomer();

  const hospitalList = useMemo(() => ['All', ...getAllHospitals()], []);

  const filteredNurses = useMemo(() => {
    return STATIC_NURSES.filter((nurse) => {
      const areaOk = selectedArea === 'All' || nurse.area === selectedArea;
      const categoryOk =
        selectedCategory === 'All' || nurse.category === selectedCategory;
      const hospitalOk =
        selectedHospital === 'All' || nurse.hospitalName === selectedHospital;
      return areaOk && categoryOk && hospitalOk;
    });
  }, [selectedArea, selectedCategory, selectedHospital]);

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
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 bg-blue-50 dark:bg-gray-900 p-4 rounded-xl border border-blue-100 dark:border-gray-800">
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

          {/* 👤 Login / Dashboard button */}
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
              🔐 লগইন
            </Link>
          )}

          <a
            href="https://wa.me/8801700000000?text=I%20need%20emergency%20nurse%20service"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white text-xs md:text-sm font-bold px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1 shadow"
          >
            🚨 ইমার্জেন্সি হোয়াটসঅ্যাপ
          </a>
        </div>
      </header>

      {/* ═══════════════ FILTERS ═══════════════ */}
      <div className="mb-6 space-y-3">
        {/* Area */}
        <div>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
            📍 এলাকা
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Uttara', 'Mirpur', 'Dhanmondi'].map((area) => (
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

        {/* Category */}
        <div>
          <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
            🏷️ ধরন
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_META.map((cat) => (
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

        {/* Hospital */}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredNurses.map((nurse) => (
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
                  src={nurse.image}
                  alt={nurse.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                  🏷️ {nurse.category}
                </p>

                <p className="text-[10px] md:text-xs text-teal-600 dark:text-teal-400 font-medium mb-3 line-clamp-1">
                  🏥 {nurse.hospitalName ?? 'ফ্রিল্যান্স নার্স'}
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

      {/* Empty */}
      {filteredNurses.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm mb-3">এই ফিল্টারে কোনো নার্স পাওয়া যায়নি।</p>
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ✖ সব ফিল্টার মুছুন
          </button>
        </div>
      )}

      <QuickBookingModal
        nurse={selectedNurse}
        onClose={() => setSelectedNurse(null)}
      />
    </main>
  );
}