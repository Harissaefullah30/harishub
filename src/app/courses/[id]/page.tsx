'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Search, User, BookOpen } from 'lucide-react'
import Link from 'next/link'

type Course = {
  id: string
  name: string
  lecturer: string
  semester: number
}

function SemesterContent() {
  const params = useParams()
  const router = useRouter()
  const semesterId = parseInt(params.id as string)

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const [name, setName] = useState('')
  const [lecturer, setLecturer] = useState('')

  const fetchCourses = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .eq('semester', semesterId)
      .order('name', { ascending: true })

    if (data) setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      name,
      lecturer,
      semester: semesterId
    })

    if (!error) {
      setIsFormOpen(false)
      setName('')
      setLecturer('')
      fetchCourses()
    } else {
      alert('Gagal: ' + error.message)
    }
  }

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.lecturer && course.lecturer.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/courses" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Folder</p>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">Semester {semesterId}</h1>
            </div>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Tambah MK
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Tambah Mata Kuliah Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Mata Kuliah *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Pemrograman Web" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Dosen (Opsional)</label>
                <input type="text" value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="Budi Santoso" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan MK</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari Mata Kuliah atau Dosen..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Memuat Mata Kuliah...</p>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada Mata Kuliah</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah MK" untuk memulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map(mk => (
              <Link href={`/courses/${mk.id}`} key={mk.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#4A90D9] transition-all block group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-50 text-[#1E3A5F] rounded-xl flex items-center justify-center font-bold text-xl group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
                    {mk.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight group-hover:text-[#4A90D9] transition-colors">{mk.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5"><User size={14} /> {mk.lecturer || 'Dosen belum diisi'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SemesterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <SemesterContent />
    </Suspense>
  )
}