'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Video, Download, Edit2 } from 'lucide-react'
import Link from 'next/link'

type GalleryFile = {
  id: string
  file_url: string
  file_type: string
  title: string
  created_at: string
}

// 1. Kita pisahkan konten utama menjadi fungsi terpisah
function FolderContent() {
  const params = useParams()
  const folderId = Array.isArray(params.id) ? params.id[0] : params.id

  const [folderName, setFolderName] = useState('')
  const [files, setFiles] = useState<GalleryFile[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // State Form (Menggunakan Array of Files)
  const [title, setTitle] = useState('') 
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const { data: folderData } = await supabase.from('gallery_folders').select('name').eq('id', folderId).single()
    if (folderData) setFolderName(folderData.name)

    const { data: filesData } = await supabase.from('gallery_files').select('*').eq('folder_id', folderId).order('created_at', { ascending: false })
    if (filesData) setFiles(filesData)
    setLoading(false)
  }

  useEffect(() => {
    if (folderId) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) return alert('Pilih file terlebih dahulu!')
    
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let successCount = 0

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const isVideo = ['mp4', 'mov', 'webm'].includes(fileExt || '')
      const fileName = `gallery-${user.id}-${Date.now()}-${i}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, file)
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName)

        await supabase.from('gallery_files').insert({
          folder_id: folderId,
          user_id: user.id,
          file_url: publicUrl,
          file_type: isVideo ? 'video' : 'image',
          title: title ? `${title} - ${i + 1}` : file.name
        })
        successCount++
      }
      
      setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
    }

    alert(`Berhasil mengunggah ${successCount} dari ${selectedFiles.length} file.`)
    setIsFormOpen(false)
    setTitle('')
    setSelectedFiles([])
    setUploadProgress(0)
    fetchData()
    setUploading(false)
  }

  const handleDeleteFile = async (id: string, url: string) => {
    if (!window.confirm('Hapus file ini?')) return
    const fileName = url.split('/').pop()
    if (fileName) await supabase.storage.from('materials').remove([fileName])
    await supabase.from('gallery_files').delete().eq('id', id)
    fetchData()
  }

  const handleSaveEdit = async (id: string) => {
    await supabase.from('gallery_files').update({ title: editTitle }).eq('id', id)
    setEditId(null)
    fetchData()
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/gallery" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Folder Galeri</p>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">{folderName || 'Memuat...'}</h1>
            </div>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Upload File
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Upload Banyak File Sekaligus</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Awalan Judul (Opsional)</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Misal: Foto Seminar (otomatis jadi Foto Seminar - 1, 2, dst)" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              
              <div className="p-6 border-2 border-dashed border-[#4A90D9] rounded-xl bg-blue-50 text-center relative">
                <ImageIcon size={32} className="mx-auto text-[#4A90D9] mb-3" />
                <label className="block text-sm font-bold text-[#1E3A5F] mb-2">Pilih Foto / Video (Bisa Banyak)</label>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple 
                  required 
                  onChange={e => setSelectedFiles(Array.from(e.target.files || []))} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E3A5F] file:text-white hover:file:bg-[#2E5A8A] cursor-pointer" 
                />
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-[#4A90D9] font-bold mt-3">{selectedFiles.length} file terpilih.</p>
                )}
              </div>

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className="bg-[#4A90D9] h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600" disabled={uploading}>Batal</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg disabled:opacity-50">
                  {uploading ? `Mengunggah... (${uploadProgress}%)` : 'Mulai Upload'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="p-8 text-center text-gray-500">Memuat file...</p>
        ) : files.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <ImageIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Folder masih kosong</h3>
            <p className="text-gray-500 text-sm">Klik "Upload File" untuk menambahkan foto atau video.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(f => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="aspect-square bg-gray-100 relative">
                  {f.file_type === 'video' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Video size={32} className="text-white" /></div>
                  ) : (
                    <img src={f.file_url} alt={f.title} className="w-full h-full object-cover" loading="lazy" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a href={f.file_url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-gray-800 hover:scale-110 transition-transform"><Download size={16} /></a>
                    <button onClick={() => handleDeleteFile(f.id, f.file_url)} className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="p-3">
                  {editId === f.id ? (
                    <div className="flex gap-1">
                      <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full text-xs border rounded px-1 text-gray-800" autoFocus />
                      <button onClick={() => handleSaveEdit(f.id)} className="text-xs bg-green-500 text-white px-2 rounded">OK</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-800 truncate pr-2" title={f.title}>{f.title}</p>
                      <button onClick={() => { setEditId(f.id); setEditTitle(f.title) }} className="text-gray-400 hover:text-blue-500"><Edit2 size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 2. Ini adalah fungsi utama yang membungkus semuanya dengan Suspense
export default function FolderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA] p-8 text-center text-gray-500">Memuat halaman galeri...</div>}>
      <FolderContent />
    </Suspense>
  )
}