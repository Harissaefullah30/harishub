'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Search, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function ShoppingPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // State Pencarian
  const [searchQuery, setSearchQuery] = useState('')

  // State Form
  const [itemName, setItemName] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [storeName, setStoreName] = useState('')
  const [category, setCategory] = useState('Makanan')
  const [notes, setNotes] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('shopping_history')
      .select('*')
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false })

    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Menghapus titik dari input harga sebelum disimpan ke database (agar jadi angka murni)
    const numericPrice = parseFloat(price.replace(/\./g, ''))

    const { error } = await supabase.from('shopping_history').insert({
      user_id: user.id,
      item_name: itemName,
      purchase_date: purchaseDate,
      price: numericPrice,
      quantity: parseInt(quantity),
      store_name: storeName,
      category,
      notes
    })

    if (!error) {
      setIsFormOpen(false)
      setItemName('')
      setPrice('')
      setQuantity('1')
      setStoreName('')
      setNotes('')
      fetchItems()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus riwayat belanja ini?')) return
    await supabase.from('shopping_history').delete().eq('id', id)
    fetchItems()
  }

  // Fungsi untuk memformat input harga otomatis pakai titik
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Hanya ambil angka
    if (value) {
      value = parseInt(value).toLocaleString('id-ID') // Format ke 12.000
    }
    setPrice(value)
  }

  // Filter Data Berdasarkan Pencarian
  const filteredItems = items.filter(item => 
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.store_name && item.store_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Riwayat Belanja</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Catat Belanja
          </button>
        </div>

        {/* Form Tambah Belanja */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Catat Pembelian Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Barang *</label>
                <input type="text" required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Kabel Data, Beras, dll" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Beli *</label>
                <input type="date" required value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input 
                  type="text" 
                  required 
                  value={price} 
                  onChange={handlePriceChange} 
                  placeholder="12.000" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah *</label>
                <input type="number" required value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Toko (Opsional)</label>
                <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Indomaret, Tokopedia, dll" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                  <option value="Makanan">Makanan & Minuman</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Pakaian">Pakaian</option>
                  <option value="Perabot">Perabot Rumah</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Warna hitam, ukuran L, dll" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Riwayat Belanja */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Bar Pencarian */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama barang atau toko..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {loading ? (
            <p className="p-8 text-center text-gray-500">Memuat data...</p>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-700">Belum ada catatan belanja</h3>
              <p className="text-gray-500 text-sm">Klik "Catat Belanja" untuk mulai mengisi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Nama Barang</th>
                    <th className="px-6 py-4 font-semibold">Toko</th>
                    <th className="px-6 py-4 font-semibold text-right">Harga</th>
                    <th className="px-6 py-4 font-semibold text-center">Jumlah</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(item.purchase_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-sm">{item.item_name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.category} {item.notes ? `• ${item.notes}` : ''}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.store_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600 text-right whitespace-nowrap">
                        Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white hover:bg-red-50 rounded-md">
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