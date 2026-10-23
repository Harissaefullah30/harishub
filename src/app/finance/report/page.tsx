'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Printer, Wallet, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

export default function ReportPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData()
  }, [router])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
  const balance = totalIncome - totalExpense

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat laporan...</div>

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Tombol Navigasi (Disembunyikan saat dicetak) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/finance" className="inline-flex items-center gap-2 text-[#1E3A5F] font-bold hover:underline bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <ArrowLeft size={20}/> Kembali ke Keuangan
          </Link>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-5 py-2 rounded-lg font-medium transition-colors">
            <Printer size={18} /> Cetak / Simpan PDF
          </button>
        </div>

        {/* KERTAS LAPORAN */}
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
          
          {/* KOP SURAT */}
          <div className="border-b-4 border-double border-gray-800 pb-6 mb-8 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[#1E3A5F] text-white rounded-xl flex items-center justify-center text-2xl font-bold">HS</div>
              <div className="text-left">
                <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wide">HarisHub</h1>
                <p className="text-sm text-gray-500 font-medium">Pusat Data & Manajemen Pribadi</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest mt-6">Laporan Keuangan Pribadi</h2>
            <p className="text-sm text-gray-600 mt-1">Periode: Seluruh Transaksi Tercatat</p>
          </div>

          {/* INFORMASI PEMILIK */}
          <div className="flex justify-between items-end mb-8 text-sm">
            <div>
              <p className="text-gray-500">Disusun Oleh:</p>
              <p className="font-bold text-gray-900 text-lg">Haris Rizki Saefullah</p>
              <p className="text-gray-500">Pemilik Akun HarisHub</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Tanggal Cetak:</p>
              <p className="font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* RINGKASAN EKSEKUTIF */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">A. Ringkasan Eksekutif</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Saldo Akhir</p>
                <p className="text-xl font-bold text-gray-900">Rp {balance.toLocaleString('id-ID')}</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Pemasukan</p>
                <p className="text-xl font-bold text-green-700">Rp {totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
                <p className="text-xl font-bold text-red-700">Rp {totalExpense.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* TABEL RINCIAN TRANSAKSI */}
          <div>
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">B. Rincian Transaksi</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-y border-gray-300">
                  <th className="px-4 py-3 font-bold">No</th>
                  <th className="px-4 py-3 font-bold">Tanggal</th>
                  <th className="px-4 py-3 font-bold">Kategori</th>
                  <th className="px-4 py-3 font-bold">Keterangan</th>
                  <th className="px-4 py-3 font-bold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500 italic">Belum ada data transaksi.</td>
                  </tr>
                ) : (
                  transactions.map((trx, index) => (
                    <tr key={trx.id} className="text-sm">
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                        {new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{trx.category}</td>
                      <td className="px-4 py-3 text-gray-600">{trx.description || '-'}</td>
                      <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TANDA TANGAN (Khusus tampilan PDF/Cetak) */}
          <div className="hidden print:flex justify-end mt-16">
            <div className="text-center">
              <p className="text-gray-600 mb-16">Mengetahui,</p>
              <p className="font-bold text-gray-900 border-t border-gray-400 pt-2 px-8">Haris Rizki Saefullah</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}