'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, User, Lock, Database, Save, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data'>('profile')
  const [loading, setLoading] = useState(true)

  // State Profil
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // State Keamanan
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/')

      setEmail(user.email || '')
      // Ambil data dari user_metadata (cara paling aman di Supabase tanpa tabel manual)
      setFullName(user.user_metadata?.full_name || 'Haris Rizki Saefullah')
      setBio(user.user_metadata?.bio || 'Digital Builder & Creator')
      
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, bio: bio }
    })

    if (error) {
      alert('Gagal menyimpan profil: ' + error.message)
    } else {
      alert('Profil berhasil diperbarui!')
      router.refresh()
    }
    setSavingProfile(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      alert('Gagal mengganti password: ' + error.message)
    } else {
      alert('Password berhasil diubah!')
      setNewPassword('')
    }
    setSavingPassword(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat pengaturan...</div>

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
            <ArrowLeft size={20} className="text-[#1E3A5F]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Pengaturan</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* MENU KIRI (TABS) */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#1E3A5F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User size={18} /> Profil Saya
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-[#1E3A5F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Lock size={18} /> Keamanan Akun
              </button>
              <button 
                onClick={() => setActiveTab('data')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-[#1E3A5F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Database size={18} /> Data & Backup
              </button>
            </div>
          </div>

          {/* KONTEN KANAN */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            
            {/* TAB PROFIL */}
            {activeTab === 'profile' && (
              <div className="animate-in fade-in">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Informasi Profil</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#1E3A5F] text-3xl font-bold border-4 border-[#1E3A5F]">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{fullName}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                    <p className="text-xs text-gray-400 mt-1">Inisial otomatis dari nama depan.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm bg-white text-gray-800 focus:ring-2 focus:ring-[#4A90D9] outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Status</label>
                    <input type="text" value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm bg-white text-gray-800 focus:ring-2 focus:ring-[#4A90D9] outline-none" />
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <button type="submit" disabled={savingProfile} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                      <Save size={18} /> {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB KEAMANAN */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Keamanan Akun</h2>
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
                  <p className="text-sm text-[#1E3A5F]">
                    Pastikan kamu menggunakan password yang kuat dan belum pernah dipakai di website lain.
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-4 py-2 border rounded-lg text-sm bg-white text-gray-800 focus:ring-2 focus:ring-[#4A90D9] outline-none" />
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <button type="submit" disabled={savingPassword} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                      <Lock size={18} /> {savingPassword ? 'Menyimpan...' : 'Perbarui Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB DATA */}
            {activeTab === 'data' && (
              <div className="animate-in fade-in">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Data & Backup</h2>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h3 className="font-bold text-gray-800 mb-1">Backup Data (Export)</h3>
                    <p className="text-sm text-gray-500 mb-4">Fitur ini sedang dalam pengembangan. Nantinya kamu bisa mengunduh semua data (Keuangan, Jurnal, dll) dalam satu file.</p>
                    <button disabled className="bg-gray-200 text-gray-500 px-5 py-2 rounded-lg font-medium cursor-not-allowed">Segera Hadir</button>
                  </div>

                  <div className="border border-red-200 bg-red-50 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={18} className="text-red-600" />
                      <h3 className="font-bold text-red-800">Zona Berbahaya</h3>
                    </div>
                    <p className="text-sm text-red-600 mb-4">Menghapus akun akan menghapus SEMUA data milikmu secara permanen. Tindakan ini tidak bisa dibatalkan.</p>
                    <button onClick={() => alert('Fitur hapus akun belum diaktifkan untuk keamanan.')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">Hapus Akun Saya</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}