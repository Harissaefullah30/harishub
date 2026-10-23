'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Search, Trash2, ExternalLink, Copy, Link as LinkIcon, Globe } from 'lucide-react'
import Link from 'next/link'

type SavedLink = {
  id: string
  title: string
  url: string
  category: string
  notes: string
}

export default function LinksPage() {
  const router = useRouter()
  const [links, setLinks] = useState<SavedLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // State Form
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('Sosial Media')
  const [customCategory, setCustomCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchLinks = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setLinks(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLinks()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Pastikan URL diawali dengan https://
    let formattedUrl = url
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = `https://${url}`
    }

    const finalCategory = category === 'Lainnya' ? customCategory : category

    const { error } = await supabase.from('links').insert({
      user_id: user.id,
      title,
      url: formattedUrl,
      category: finalCategory,
      notes
    })

    if (!error) {
      setIsFormOpen(false)
      setTitle('')
      setUrl('')
      setNotes('')
      setCustomCategory('')
      fetchLinks()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus link ini?')) return
    await supabase.from('links').delete().eq('id', id)
    fetchLinks()
  }

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000) // Kembali normal setelah 2 detik
  }

  // Fungsi mengambil domain untuk Favicon (logo website)
  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch {
      return null
    }
  }

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (link.notes && link.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Link Penting</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Tambah Link
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Simpan Link Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Judul Link *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Tugas Kuliah, Grup WA, dll" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL / Tautan *</label>
                <input type="text" required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kategori *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                  <option value="Sosial Media">Sosial Media</option>
                  <option value="Tugas Kuliah">Tugas Kuliah</option>
                  <option value="Belanja">Belanja / E-Commerce</option>
                  <option value="Referensi">Referensi / Bacaan</option>
                  <option value="Lainnya">Lainnya (Isi Manual)</option>
                </select>
                {category === 'Lainnya' && (
                  <input type="text" required value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Ketik kategori baru..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 mt-2" />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Misal: Deadline 20 Okt" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan Link</button>
              </div>
            </form>
          </div>
        )}

        {/* Pencarian */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari judul, kategori, atau catatan..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Grid Link */}
        {loading ? (
          <p className="p-8 text-center text-gray-500">Memuat data...</p>
        ) : filteredLinks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <Globe size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada link tersimpan</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah Link" untuk menyimpan tautan pertamamu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map(link => (
              <div key={link.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100">
                      {getFavicon(link.url) ? (
                        <img src={getFavicon(link.url)!} alt="logo" className="w-full h-full object-contain" />
                      ) : (
                        <LinkIcon size={20} className="text-gray-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1E3A5F] px-2 py-1 rounded-md">
                      {link.category}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 line-clamp-1">{link.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{link.url}</p>
                  
                  {link.notes && (
                    <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg italic">"{link.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors">
                    <ExternalLink size={14} /> Buka
                  </a>
                  <button onClick={() => copyToClipboard(link.id, link.url)} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 transition-colors flex items-center justify-center" title="Salin Link">
                    {copiedId === link.id ? <span className="text-xs text-green-600 font-bold">Tersalin!</span> : <Copy size={14} />}
                  </button>
                  <button onClick={() => handleDelete(link.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-colors" title="Hapus">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}