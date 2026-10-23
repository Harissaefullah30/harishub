'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Plus, Car, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

type Vehicle = {
  id: string
  name: string
  plate_number: string
  brand: string
  image_url: string
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // State Form
  const [name, setName] = useState('')
  const [plate, setPlate] = useState('')
  const [brand, setBrand] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setVehicles(data)
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let imageUrl = ''

    // Proses Upload Foto jika ada
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `vehicle-${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(fileName, file)

      if (uploadError) {
        alert('Gagal upload foto: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName)
      imageUrl = publicUrl
    }

    const { error } = await supabase.from('vehicles').insert({
      user_id: user.id,
      name,
      plate_number: plate,
      brand,
      image_url: imageUrl
    })

    if (!error) {
      setIsFormOpen(false)
      setName('')
      setPlate('')
      setBrand('')
      setFile(null)
      fetchVehicles()
    } else {
      alert('Gagal: ' + error.message)
    }
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Kendaraan Saya</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Tambah Kendaraan
          </button>
        </div>

        {/* Form Tambah Kendaraan */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Tambah Kendaraan Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kendaraan *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Motor Harian, Mobil Keluarga" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nomor Plat *</label>
                <input type="text" required value={plate} onChange={e => setPlate(e.target.value)} placeholder="B 1234 XYZ" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Merek / Tipe (Opsional)</label>
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Honda Vario 150, Toyota Avanza" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Foto Kendaraan (Opsional)</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1E3A5F] hover:file:bg-blue-100" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {uploading ? 'Menyimpan...' : 'Simpan Kendaraan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Kendaraan */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat...</p>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Car size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada kendaraan</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah Kendaraan" untuk memulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(v => (
              <Link href={`/vehicles/${v.id}`} key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all block group overflow-hidden">
                
                {/* Bagian Atas: Foto atau Ikon */}
                <div className="h-40 w-full bg-gray-100 relative">
                  {v.image_url ? (
                    <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[#1E3A5F] group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
                      <Car size={48} />
                    </div>
                  )}
                </div>

                {/* Bagian Bawah: Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{v.name}</h3>
                  <div className="inline-block bg-gray-100 text-gray-700 font-mono text-sm px-2 py-1 rounded-md font-bold tracking-widest mt-1 border border-gray-200">
                    {v.plate_number}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{v.brand || 'Merek tidak diisi'}</p>
                </div>

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}