'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Wrench, Calendar, Gauge, Banknote, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Maintenance = {
  id: string
  title: string
  date: string
  current_km: number
  cost: number
  notes: string
}

// 1. Komponen isi dipisahkan
function VehicleDetailContent() {
  const params = useParams()
  const vehicleId = Array.isArray(params.id) ? params.id[0] : params.id

  const [vehicleName, setVehicleName] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [logs, setLogs] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State Form (new Date sudah dipindah ke useEffect di bawah)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [km, setKm] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')

  const fetchVehicleAndLogs = async () => {
    setLoading(true)
    const { data: vehicleData } = await supabase.from('vehicles').select('name, plate_number').eq('id', vehicleId).single()
    if (vehicleData) {
      setVehicleName(vehicleData.name)
      setVehiclePlate(vehicleData.plate_number)
    }

    const { data: logsData } = await supabase
      .from('maintenance_logs')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false })

    if (logsData) setLogs(logsData)
    setLoading(false)
  }

  useEffect(() => {
    // Set tanggal hari ini setelah komponen dimuat
    setDate(new Date().toISOString().split('T')[0])
    
    if (vehicleId) fetchVehicleAndLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('maintenance_logs').insert({
      vehicle_id: vehicleId,
      user_id: user.id,
      title,
      date,
      current_km: parseInt(km) || 0,
      cost: parseFloat(cost) || 0,
      notes
    })

    if (!error) {
      setIsFormOpen(false)
      setTitle('')
      setKm('')
      setCost('')
      setNotes('')
      fetchVehicleAndLogs()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus riwayat servis ini?')) return
    await supabase.from('maintenance_logs').delete().eq('id', id)
    fetchVehicleAndLogs()
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/vehicles" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Kendaraan</p>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">{vehicleName} <span className="text-sm font-normal text-gray-500">({vehiclePlate})</span></h1>
            </div>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Catat Servis
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Catat Riwayat Perawatan</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Judul Perawatan *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ganti Oli Mesin, Servis CVT" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal *</label>
                  <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kilometer (KM)</label>
                  <input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder="Contoh: 15000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Biaya (Rp)</label>
                  <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="Contoh: 50000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Bengkel Pak Budi, Oli Yamalube..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan Catatan</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Memuat riwayat...</p>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Wrench size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada riwayat perawatan</h3>
            <p className="text-gray-500 text-sm">Klik "Catat Servis" untuk mulai mencatat ganti oli atau servis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E3A5F]"></div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Wrench size={18} className="text-[#4A90D9]" /> {log.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md flex items-center gap-1">
                      <Calendar size={12} /> {new Date(log.date).toLocaleDateString('id-ID')}
                    </span>
                    <button onClick={() => handleDelete(log.id)} className="text-gray-400 hover:text-red-500 p-1 bg-gray-50 hover:bg-red-50 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  {log.current_km > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Gauge size={16} className="text-gray-400" /> {log.current_km.toLocaleString('id-ID')} KM
                    </div>
                  )}
                  {log.cost > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                      <Banknote size={16} className="text-green-500" /> Rp {log.cost.toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                {log.notes && (
                  <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100 italic">
                    "{log.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// 2. Ini adalah fungsi utama yang membungkus semuanya dengan Suspense
export default function VehicleDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA] p-8 text-center text-gray-500">Memuat detail kendaraan...</div>}>
      <VehicleDetailContent />
    </Suspense>
  )
}