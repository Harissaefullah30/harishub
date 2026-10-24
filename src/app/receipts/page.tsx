'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Search, Trash2, FileText, Image as ImageIcon, Download, UploadCloud } from 'lucide-react'
import Link from 'next/link'

type Receipt = {
  id: string
  title: string
  category: string
  receipt_date: string
  amount: number
  issuer: string
  file_url: string
  file_type: string
}

export default function ReceiptsPage() {
  const router = useRouter()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // State Form
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Kos / Kontrakan')
  const [receiptDate, setReceiptDate] = useState('')
  const [amount, setAmount] = useState('')
  const [issuer, setIssuer] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchReceipts = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('receipt_date', { ascending: false })

    if (data) setReceipts(data)
    setLoading(false)
  }

    useEffect(() => {
    // Set tanggal setelah komponen dimuat
    setReceiptDate(new Date().toISOString().split('T')[0])
    
    fetchReceipts()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let fileUrl = ''
    let fileType = ''

    // Proses Upload File
    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `receipt-${user.id}-${Date.now()}.${fileExt}`
      
      // Simpan ke Storage
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(fileName, file)

      if (uploadError) {
        alert('Gagal upload file: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName)
      fileUrl = publicUrl
      fileType = fileExt || ''
    } else {
      alert('Pilih file kwitansi terlebih dahulu!')
      setUploading(false)
      return
    }

    const numericAmount = amount ? parseFloat(amount.replace(/\./g, '')) : 0

    const { error } = await supabase.from('receipts').insert({
      user_id: user.id,
      title,
      category,
      receipt_date: receiptDate,
      amount: numericAmount,
      issuer,
      file_url: fileUrl,
      file_type: fileType
    })

    if (!error) {
      setIsFormOpen(false)
      setTitle('')
      setAmount('')
      setIssuer('')
      setFile(null)
      fetchReceipts()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
    setUploading(false)
  }

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!window.confirm('Hapus kwitansi ini? File juga akan dihapus permanen.')) return
    
    // Hapus file dari Storage
    if (fileUrl) {
      const fileName = fileUrl.split('/').pop()
      if (fileName) await supabase.storage.from('materials').remove([fileName])
    }
    
    // Hapus dari database
    await supabase.from('receipts').delete().eq('id', id)
    fetchReceipts()
  }

  const filteredReceipts = receipts.filter(rc => 
    rc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rc.issuer && rc.issuer.toLowerCase().includes(searchQuery.toLowerCase())) ||
    rc.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Kwitansi & Bukti</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Tambah Kwitansi
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Upload Bukti Pembayaran / Kwitansi</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Judul Kwitansi *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Misal: Kwitansi Kos Bulan Oktober" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                  <option value="Kos / Kontrakan">Kos / Kontrakan</option>
                  <option value="Pembelian Barang">Pembelian Barang</option>
                  <option value="Jasa / Servis">Jasa / Servis</option>
                  <option value="Pendidikan">Pendidikan / Kuliah</option>
                  <option value="Tagihan">Tagihan (Listrik/Air/dll)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Kwitansi *</label>
                <input type="date" required value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nominal (Rp) - Opsional</label>
                <input 
                  type="text" 
                  value={amount} 
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val) val = parseInt(val).toLocaleString('id-ID')
                    setAmount(val)
                  }} 
                  placeholder="Misal: 500.000" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dari / Untuk (Toko/Orang) - Opsional</label>
                <input type="text" value={issuer} onChange={e => setIssuer(e.target.value)} placeholder="Misal: Pak Budi Kos" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div className="md:col-span-2 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
                <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (PDF, JPG, PNG) *</label>
                <input type="file" accept=".pdf,image/*" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#1E3A5F] hover:file:bg-blue-100 cursor-pointer" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {uploading ? 'Mengunggah...' : 'Simpan Kwitansi'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabel Kwitansi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari judul, toko, atau kategori..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          {loading ? (
            <p className="p-8 text-center text-gray-500">Memuat data...</p>
          ) : filteredReceipts.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-700">Belum ada kwitansi tersimpan</h3>
              <p className="text-gray-500 text-sm">Klik "Tambah Kwitansi" untuk mengunggah bukti pertamamu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Judul Kwitansi</th>
                    <th className="px-6 py-4 font-semibold">Nominal</th>
                    <th className="px-6 py-4 font-semibold text-center">File</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReceipts.map(rc => (
                    <tr key={rc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(rc.receipt_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                          {rc.file_type === 'pdf' ? (
                            <FileText size={16} className="text-red-500" />
                          ) : (
                            <ImageIcon size={16} className="text-blue-500" />
                          )}
                          {rc.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {rc.category} {rc.issuer ? `• ${rc.issuer}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        {rc.amount ? `Rp ${rc.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a href={rc.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Buka File">
                          <Download size={18} />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(rc.id, rc.file_url)} className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white hover:bg-red-50 rounded-md" title="Hapus Kwitansi">
                          <Trash2 size={18} />
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