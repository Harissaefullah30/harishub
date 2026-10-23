'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, BookOpen, Trash2, User } from 'lucide-react'
import Link from 'next/link'

type Course = {
  id: string
  name: string
  lecturer: string
  semester: number
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  // State Form
  const [name, setName] = useState('')
  const [lecturer, setLecturer] = useState('')
  const [semester, setSemester] = useState('1')

  const fetchCourses = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      name,
      lecturer,
      semester: parseInt(semester)
    })

    if (!error) {
      setIsFormOpen(false)
      setName('')
      setLecturer('')
      setSemester('1')
      fetchCourses()
    } else {
      alert('Gagal: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus Mata Kuliah ini? Semua materi di dalamnya juga akan terhapus.')) return
    await supabase.from('courses').delete().eq('id', id)
    fetchCourses()
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
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Materi Kuliah</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Tambah MK
          </button>
        </div>

        {/* Form Tambah MK */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Tambah Mata Kuliah</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Mata Kuliah *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Pemrograman Web" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Dosen (Opsional)</label>
                <input type="text" value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="Budi Santoso" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                <input type="number" required value={semester} onChange={e => setSemester(e.target.value)} placeholder="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan MK</button>
              </div>
            </form>
          </div>
        )}

        {/* List MK */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat...</p>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada Mata Kuliah</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah MK" untuk memulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(mk => (
              <div key={mk.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group overflow-hidden flex flex-col justify-between">
                <Link href={`/courses/${mk.id}`} className="p-5 flex-1 block">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-50 text-[#1E3A5F] rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
                      {mk.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Sem {mk.semester}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight group-hover:text-[#4A90D9] transition-colors">{mk.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5"><User size={14} /> {mk.lecturer || 'Dosen belum diisi'}</p>
                </Link>
                <div className="px-5 py-3 border-t border-gray-50 flex justify-end bg-gray-50/50">
                  <button onClick={() => handleDelete(mk.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Hapus Mata Kuliah">
                    <Trash2 size={18} />
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