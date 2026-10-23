'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Printer, Activity } from 'lucide-react'
import Link from 'next/link'

type HealthRecord = {
  id: string
  record_date: string
  height: number
  weight: number
  blood_pressure: string
  complaint: string
  notes: string
}

export default function HealthReportPage() {
  const router = useRouter()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/')

      const { data } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('record_date', { ascending: false })

      if (data) setRecords(data)
      setLoading(false)
    }
    fetchData()
  }, [router])

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat laporan...</div>

  const latest = records.length > 0 ? records[0] : null

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Actions (Print hidden) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/health" className="inline-flex items-center gap-2 text-[#1E3A5F] font-bold hover:underline bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <ArrowLeft size={20}/> Kembali ke Kesehatan
          </Link>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-5 py-2 rounded-lg font-medium transition-colors">
            <Printer size={18} /> Cetak / Simpan PDF
          </button>
        </div>

        {/* KERTAS LAPORAN */}
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
          
          {/* KOP */}
          <div className="border-b-4 border-double border-gray-800 pb-6 mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wide">HarisHub Health</h1>
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest mt-2">Laporan Rekam Medis & Fisik</h2>
            <p className="text-sm text-gray-600 mt-1">Pemilik: Haris Rizki Saefullah</p>
            <p className="text-sm text-gray-600">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* RINGKASAN TERAKHIR */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4 text-lg">A. Kondisi Terakhir</h3>
            {latest ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase">Berat</p>
                  <p className="text-lg font-bold text-gray-900">{latest.weight} <span className="text-sm font-normal">kg</span></p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase">Tinggi</p>
                  <p className="text-lg font-bold text-gray-900">{latest.height} <span className="text-sm font-normal">cm</span></p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase">Tek. Darah</p>
                  <p className="text-lg font-bold text-gray-900">{latest.blood_pressure || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase">Keluhan</p>
                  <p className="text-sm font-bold text-gray-900">{latest.complaint}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Belum ada data.</p>
            )}
          </div>

          {/* TABEL DETAIL RIWAYAT */}
          <div>
            <h3 className="font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4 text-lg">B. Riwayat Pemeriksaan Lengkap</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-y border-gray-300">
                  <th className="px-4 py-3 font-bold">Tanggal</th>
                  <th className="px-4 py-3 font-bold">Fisik (BB / TB)</th>
                  <th className="px-4 py-3 font-bold">Tensi</th>
                  <th className="px-4 py-3 font-bold">Diagnosa / Keluhan</th>
                  <th className="px-4 py-3 font-bold">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((r, index) => (
                  <tr key={r.id} className="text-sm">
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-medium">
                      {new Date(r.record_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      <span className="font-bold">{r.weight}</span> kg / <span className="font-bold">{r.height}</span> cm
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.blood_pressure || '-'}</td>
                    <td className="px-4 py-3 font-medium text-[#1E3A5F]">{r.complaint}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs italic">{r.notes || '-'}</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500 italic">Belum ada data pemeriksaan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TANDA TANGAN (Khusus Cetak) */}
          <div className="hidden print:flex justify-end mt-16">
            <div className="text-center">
              <p className="text-gray-600 mb-16">Dibuat Oleh,</p>
              <p className="font-bold text-gray-900 border-t border-gray-400 pt-2 px-8">Haris Rizki Saefullah</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}