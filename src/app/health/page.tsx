'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Search, Trash2, HeartPulse, Activity, FileText } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type HealthRecord = {
  id: string
  record_date: string
  height: number
  weight: number
  blood_pressure: string
  complaint: string
  notes: string
}

export default function HealthPage() {
  const router = useRouter()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State Form
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [complaint, setComplaint] = useState('')
  const [notes, setNotes] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('health_records')
      .select('*')
      .eq('user_id', user.id)
      .order('record_date', { ascending: true }) // Urut dari terlama untuk grafik

    if (data) setRecords(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('health_records').insert({
      user_id: user.id,
      record_date: recordDate,
      height: parseFloat(height),
      weight: parseFloat(weight),
      blood_pressure: bloodPressure,
      complaint,
      notes
    })

    if (!error) {
      setIsFormOpen(false)
      setHeight(''); setWeight(''); setBloodPressure(''); setComplaint(''); setNotes('')
      fetchData()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus catatan kesehatan ini?')) return
    await supabase.from('health_records').delete().eq('id', id)
    fetchData()
  }

  // Siapkan data untuk grafik (dibalik agar tanggal terlama di kiri)
  const chartData = [...records].reverse().map(r => ({
    date: new Date(r.record_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    berat: r.weight,
    tinggi: r.height
  }))

  // Ambil data terbaru untuk ringkasan
  const latest = records.length > 0 ? records[records.length - 1] : null

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Kesehatan & Fisik</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/health/report" className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-[#1E3A5F] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <FileText size={16} /> Lihat Laporan
            </Link>
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> Catat Kesehatan
            </button>
          </div>
        </div>

        {/* Form Tambah Data */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Catat Progres Kesehatan Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Cek *</label>
                <input type="date" required value={recordDate} onChange={e => setRecordDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Keluhan / Kondisi *</label>
                <input type="text" required value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="Misal: Bugar, Pusing, Pegal" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tinggi Badan (cm) *</label>
                <input type="number" step="0.1" required value={height} onChange={e => setHeight(e.target.value)} placeholder="170.5" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Berat Badan (kg) *</label>
                <input type="number" step="0.1" required value={weight} onChange={e => setWeight(e.target.value)} placeholder="65.5" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tekanan Darah (Opsional)</label>
                <input type="text" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} placeholder="120/80" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Setelah olahraga" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan Data</button>
              </div>
            </form>
          </div>
        )}

        {/* Ringkasan Terakhir & Grafik */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Kartu Ringkasan */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500"><HeartPulse size={20} /></div>
                <h3 className="font-bold text-gray-800">Kondisi Terakhir</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Berat Badan</span>
                  <span className="font-bold text-gray-800">{latest?.weight} kg</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Tinggi Badan</span>
                  <span className="font-bold text-gray-800">{latest?.height} cm</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Tekanan Darah</span>
                  <span className="font-bold text-gray-800">{latest?.blood_pressure || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Keluhan</span>
                  <span className="font-bold text-[#4A90D9] text-right">{latest?.complaint}</span>
                </div>
              </div>
            </div>

            {/* Grafik Garis */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-[#4A90D9]" />
                <h3 className="font-bold text-gray-800">Grafik Perkembangan (Berat Badan)</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="berat" stroke="#1E3A5F" strokeWidth={3} dot={{ r: 4, fill: '#1E3A5F' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Riwayat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Riwayat Pengecekan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Berat / Tinggi</th>
                  <th className="px-6 py-4 font-semibold">Tekanan Darah</th>
                  <th className="px-6 py-4 font-semibold">Keluhan</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...records].reverse().map(record => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(record.record_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 text-sm">
                      {record.weight} kg <span className="text-gray-400 font-normal">/</span> {record.height} cm
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.blood_pressure || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#4A90D9] text-sm">{record.complaint}</div>
                      <div className="text-xs text-gray-400">{record.notes}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(record.id)} className="text-gray-400 hover:text-red-500 p-1 bg-white hover:bg-red-50 rounded-md">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Belum ada riwayat kesehatan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}