'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Plus, Key, Lock, Globe, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

// Tipe data untuk Akun
type Account = {
  id: string
  app_name: string
  email_username: string
  password: string
  category: string
  notes: string
}

export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Form
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [appName, setAppName] = useState('')
  const [emailUsername, setEmailUsername] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState('Sosial')
  const [notes, setNotes] = useState('')
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchAccounts()
  }, [])

  // Ambil data akun dari Supabase
  const fetchAccounts = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setAccounts(data)
    setLoading(false)
  }

  // Simpan akun baru
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('accounts').insert({
      user_id: user.id,
      app_name: appName,
      email_username: emailUsername,
      password: password,
      category: category,
      notes: notes
    })

    if (!error) {
      setIsFormOpen(false)
      setAppName('')
      setEmailUsername('')
      setPassword('')
      setNotes('')
      fetchAccounts() // Refresh data
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Halaman */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Akun & Password</h1>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Tambah Akun
          </button>
        </div>

        {/* Form Tambah Akun (Muncul saat tombol diklik) */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Tambah Akun Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Aplikasi</label>
                <input 
                  type="text" 
                  required 
                  value={appName} 
                  onChange={e => setAppName(e.target.value)} 
                  placeholder="Instagram, Google, dll" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90D9] text-sm text-gray-800 bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email / Username</label>
                <input 
                  type="text" 
                  required 
                  value={emailUsername} 
                  onChange={e => setEmailUsername(e.target.value)} 
                  placeholder="haris@email.com" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90D9] text-sm text-gray-800 bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="text" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Password akun" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90D9] text-sm text-gray-800 bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90D9] text-sm bg-white text-gray-800"
                >
                  <option value="Sosial">Sosial</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Kuliah">Kuliah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Catatan tambahan..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90D9] text-sm text-gray-800 bg-white" 
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg font-medium">Simpan Akun</button>
              </div>

            </form>
          </div>
        )}

        {/* Daftar Akun */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Memuat data...</p>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">Belum ada akun tersimpan</h3>
            <p className="text-gray-500 text-sm mt-1">Klik tombol "Tambah Akun" untuk mulai menyimpan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-[#1E3A5F] rounded-xl flex items-center justify-center font-bold text-lg">
                        {acc.app_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 leading-tight">{acc.app_name}</h3>
                        <span className="text-[10px] font-semibold text-[#4A90D9] uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {acc.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe size={14} className="text-gray-400" /> {acc.email_username}
                    </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-2">
                      <div className="flex items-center gap-2">
                        <Key size={14} className="text-gray-400" /> 
                        <span className="font-mono">
                          {visiblePasswords[acc.id] ? acc.password : '••••••••'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setVisiblePasswords(prev => ({ ...prev, [acc.id]: !prev[acc.id] }))}
                        className="text-gray-400 hover:text-[#1E3A5F] transition-colors"
                        title="Lihat Password"
                      >
                        {visiblePasswords[acc.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                {acc.notes && (
                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 italic">
                    "{acc.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}