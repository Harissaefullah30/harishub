'use client'

import { ArrowLeft, Sparkles, Lock, Search, Gamepad2, Star, StickyNote } from 'lucide-react'
import Link from 'next/link'

export default function HarisSpacePage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-[#1E3A5F] font-bold hover:underline">
          <ArrowLeft size={20}/> Kembali ke Dashboard
        </Link>

        {/* HEADER PERSONAL HARIS SPACE */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#3A5F8A] rounded-3xl p-8 md:p-12 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400 opacity-10 rounded-tr-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white text-[#1E3A5F] rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold border-4 border-[#4A90D9] shadow-lg">
              HS
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3">
                Haris Space <Sparkles className="text-yellow-300" size={28} />
              </h1>
              <p className="text-blue-100 text-lg">Ruang rahasia & markas pribadi Haris Rizki Saefullah.</p>
            </div>
          </div>
        </div>

        {/* AREA MINI-APPS */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1E3A5F]">Aplikasi Pribadi</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* KOTAK 1: PENCARIAN CEPAT (SUDAH AKTIF) */}
          <Link href="/haris-space/search" className="bg-white rounded-2xl shadow-sm border border-[#4A90D9] p-6 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer">
            <div className="w-14 h-14 bg-blue-50 text-[#1E3A5F] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Pencarian Cepat</h3>
            <p className="text-xs text-gray-500 mt-1">Cari seluruh data di HarisHub</p>
            <div className="absolute top-2 right-2 bg-blue-100 text-[#1E3A5F] text-[10px] font-bold px-2 py-1 rounded-md">Aktif</div>
          </Link>

          {/* Kotak 2: Daftar Keinginan (Segera) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden group hover:shadow-md transition-all cursor-not-allowed opacity-70">
            <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-3"><Star size={28} /></div>
            <h3 className="font-bold text-gray-800">Daftar Keinginan</h3>
            <p className="text-xs text-gray-500 mt-1">Wishlist barang impian</p>
          </div>

          {/* Kotak 3: Game Sederhana (Segera) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden group hover:shadow-md transition-all cursor-not-allowed opacity-70">
            <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3"><Gamepad2 size={28} /></div>
            <h3 className="font-bold text-gray-800">Game Sederhana</h3>
            <p className="text-xs text-gray-500 mt-1">Isi waktu luang</p>
          </div>

        </div>

      </div>
    </div>
  )
}