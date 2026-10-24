'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Download, BookOpen, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Material = {
  id: string
  title: string
  type: string
  content: string
  file_url: string
  created_at: string
}

function CourseDetailContent() {
  const params = useParams()
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()

  const [courseName, setCourseName] = useState('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState('Teori')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchCourseAndMaterials = async () => {
    setLoading(true)
    const { data: courseData } = await supabase.from('courses').select('name').eq('id', courseId).single()
    if (courseData) setCourseName(courseData.name)

    const { data: materialsData } = await supabase
      .from('materials')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (materialsData) setMaterials(materialsData)
    setLoading(false)
  }

  useEffect(() => {
    if (courseId) fetchCourseAndMaterials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let fileUrl = ''

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, file)

      if (uploadError) {
        alert('Gagal upload file: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName)
      fileUrl = publicUrl
    }

    const { error } = await supabase.from('materials').insert({
      course_id: courseId,
      user_id: user.id,
      title,
      type,
      content,
      file_url: fileUrl
    })

    if (!error) {
      setIsFormOpen(false)
      setTitle('')
      setContent('')
      setFile(null)
      fetchCourseAndMaterials()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
    setUploading(false)
  }

  const handleDeleteMaterial = async (id: string, fileUrl: string) => {
    if (!window.confirm('Hapus materi ini?')) return
    if (fileUrl) {
      const fileName = fileUrl.split('/').pop()
      if (fileName) await supabase.storage.from('materials').remove([fileName])
    }
    await supabase.from('materials').delete().eq('id', id)
    fetchCourseAndMaterials()
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/courses" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Mata Kuliah</p>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">{courseName || 'Memuat...'}</h1>
            </div>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16} /> Tambah Materi
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Tambah Materi Baru</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Judul Materi *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Pertemuan 1 - Pengenalan" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipe</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                    <option value="Teori">Teori</option>
                    <option value="Praktikum">Praktikum</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Ujian">Ujian</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tulis catatan di sini..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white"></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Upload File PDF/Gambar (Opsional)</label>
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1E3A5F] hover:file:bg-blue-100" />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {uploading ? 'Menyimpan...' : 'Simpan Materi'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Memuat materi...</p>
        ) : materials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada materi</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah Materi" untuk mulai menyimpan catatan atau file.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map(mat => (
              <div key={mat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${mat.type === 'Tugas' ? 'bg-red-50 text-red-600' : mat.type === 'Ujian' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#1E3A5F]'}`}>
                      {mat.type}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg">{mat.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 hidden md:block">{new Date(mat.created_at).toLocaleDateString('id-ID')}</span>
                    <button onClick={() => handleDeleteMaterial(mat.id, mat.file_url)} className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-gray-50 hover:bg-red-50 rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {mat.content && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{mat.content}</p>}
                {mat.file_url && (
                  <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-[#1E3A5F] transition-colors">
                    <Download size={16} /> Download Lampiran
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <CourseDetailContent />
    </Suspense>
  )
}