'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Wallet, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

export default function FinancePage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State Form
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Makanan')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (data) setTransactions(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const numericAmount = parseFloat(amount.replace(/\./g, ''))

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type,
      amount: numericAmount,
      category,
      description,
      date
    })

    if (!error) {
      setIsFormOpen(false)
      setAmount('')
      setDescription('')
      fetchData()
    } else {
      alert('Gagal: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus transaksi ini?')) return
    await supabase.from('transactions').delete().eq('id', id)
    fetchData()
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) value = parseInt(value).toLocaleString('id-ID')
    setAmount(value)
  }

  // Hitung Ringkasan
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Keuangan Saya</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Catat Transaksi
          </button>
        </div>

        {/* Kartu Ringkasan (Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#1E3A5F]"><Wallet size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Saldo</p>
              <h3 className="text-xl font-bold text-[#1E3A5F]">Rp {balance.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600"><TrendingUp size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pemasukan</p>
              <h3 className="text-xl font-bold text-green-600">Rp {totalIncome.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600"><TrendingDown size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pengeluaran</p>
              <h3 className="text-xl font-bold text-red-600">Rp {totalExpense.toLocaleString('id-ID')}</h3>
            </div>
          </div>
        </div>

        {/* Form Tambah Transaksi */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Catat Transaksi Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Transaksi *</label>
                <select value={type} onChange={e => setType(e.target.value as 'income'|'expense')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                  <option value="expense">Pengeluaran (Uang Keluar)</option>
                  <option value="income">Pemasukan (Uang Masuk)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nominal (Rp) *</label>
                <input type="text" required value={amount} onChange={handleAmountChange} placeholder="50.000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                  <optgroup label="Pengeluaran">
                    <option value="Makanan">Makanan & Minuman</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Kuliah">Kuliah / Pendidikan</option>
                    <option value="Belanja">Belanja Harian</option>
                    <option value="Lainnya">Lainnya</option>
                  </optgroup>
                  <optgroup label="Pemasukan">
                    <option value="Gaji">Gaji / Uang Saku</option>
                    <option value="Freelance">Freelance / Proyek</option>
                    <option value="Bonus">Bonus</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal *</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Beli makan siang, bayar kos, dll" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Riwayat Transaksi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Riwayat Transaksi</h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-gray-500">Memuat data...</p>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-700">Belum ada transaksi</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Keterangan</th>
                    <th className="px-6 py-4 font-semibold text-right">Nominal</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-sm">{trx.category}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{trx.description || '-'}</div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(trx.id)} className="text-gray-400 hover:text-red-500 p-1 bg-white hover:bg-red-50 rounded-md">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}