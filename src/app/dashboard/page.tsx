'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { LayoutDashboard, UserCircle, FileText, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Cek apakah user sudah login
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/') // Tendang ke halaman login jika belum login
      }
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-[#1E3A5F] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-[#2E5A8A]">
          <div className="w-10 h-10 bg-white text-[#1E3A5F] rounded-lg flex items-center justify-center font-bold text-xl">
            HS
          </div>
          <span className="font-bold text-lg tracking-wide">HarisHub</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-[#2E5A8A] px-4 py-3 rounded-lg text-sm font-medium">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 hover:bg-[#2E5A8A] px-4 py-3 rounded-lg text-sm font-medium transition-colors">
            <UserCircle size={18} /> Akun & Password
          </a>
          <a href="#" className="flex items-center gap-3 hover:bg-[#2E5A8A] px-4 py-3 rounded-lg text-sm font-medium transition-colors">
            <FileText size={18} /> Catatan
          </a>
          <a href="#" className="flex items-center gap-3 hover:bg-[#2E5A8A] px-4 py-3 rounded-lg text-sm font-medium transition-colors">
            <Settings size={18} /> Pengaturan
          </a>
        </nav>

        <div className="p-4 border-t border-[#2E5A8A]">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full hover:bg-red-500 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-red-100 hover:text-white">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col">
        {/* Navbar Atas */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-[#1E3A5F]">Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Halo, Haris!</span>
            <div className="w-8 h-8 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white text-xs font-bold">
              HS
            </div>
          </div>
        </header>

        {/* Isi Dashboard */}
        <div className="p-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Selamat datang di HarisHub!</h3>
            <p className="text-gray-500">Ini adalah halaman dashboard pertamamu. Fitur penyimpanan akan segera hadir.</p>
          </div>
        </div>
      </main>
    </div>
  )
}