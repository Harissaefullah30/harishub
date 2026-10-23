'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Search, Folder, Trash2, Image as ImageIcon, Video } from 'lucide-react'
import Link from 'next/link'

type Folder = {
  id: string
  name: string
  created_at: string
}

export default function GalleryPage() {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchFolders = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('gallery_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setFolders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchFolders()
  }, [router])

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('gallery_folders').insert({
      user_id: user.id,
      name: folderName
    })

    if (!error) {
      setIsFormOpen(false)
      setFolderName('')
      fetchFolders()
    } else {
      alert('Gagal membuat folder: ' + error.message)
    }
  }

  const handleDeleteFolder = async (id: string) => {
    if (!window.confirm('Hapus folder ini? Semua foto dan video di dalamnya akan terhapus permanen.')) return
    await supabase.from('gallery_folders').delete().eq('id', id)
    fetchFolders()
  }

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Galeri Saya</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Buat Folder Baru
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Buat Folder Baru</h2>
            <form onSubmit={createFolder} className="flex flex-col md:flex-row gap-3">
              <input type="text" required value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Misal: Foto Kuliah, Liburan, Video Kucing" className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Simpan Folder</button>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Cari nama folder..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-500">Memuat galeri...</p>
        ) : filteredFolders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <Folder size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada folder</h3>
            <p className="text-gray-500 text-sm">Klik "Buat Folder Baru" untuk mulai mengarsipkan foto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredFolders.map(folder => (
              <div key={folder.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden flex flex-col">
                <Link href={`/gallery/${folder.id}`} className="p-6 flex flex-col items-center justify-center flex-1">
                  <Folder size={48} className="text-[#4A90D9] mb-3 group-hover:scale-110 transition-transform" fill="#E6F0FA" />
                  <h3 className="font-bold text-gray-800 text-center line-clamp-2">{folder.name}</h3>
                </Link>
                <div className="px-4 py-2 border-t border-gray-50 flex justify-end bg-gray-50/50">
                  <button onClick={() => handleDeleteFolder(folder.id)} className="text-gray-400 hover:text-red-500 p-1" title="Hapus Folder">
                    <Trash2 size={16} />
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