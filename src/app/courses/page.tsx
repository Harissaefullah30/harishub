'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, BookOpen, Search, FolderOpen } from 'lucide-react'
import Link from 'next/link'

function CoursesContent() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // State untuk form tambah MK
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [lecturer, setLecturer] = useState('')
  const [semester, setSemester] = useState('')

  const fetchCourses = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('semester', { ascending: true })

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
      setSemester('')
      fetchCourses()
    } else {
      alert('Gagal: ' + error.message)
    }
  }

  // LOGIKA PENCARIAN
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.lecturer && course.lecturer.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // LOGIKA MENGELOMPOKKAN BERDASARKAN SEMESTER
  const groupedCourses = filteredCourses.reduce((acc, course) => {
    const sem = course.semester || 1
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(course)
    return acc
  }, {} as Record<number, any[]>)

  // Urutkan semester
  const sortedSemesters = Object.keys(groupedCourses).map(Number).sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Materi Kuliah</h1>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Tambah MK
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-4">
            <h2 className="font-bold text-gray-800 mb-4">Tambah Mata Kuliah</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Mata Kuliah *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Pemrograman Web" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Dosen (Opsional)</label>
                <input type="text" value={lecturer} onChange={e => setLecturer(e.target.value)} placeholder="Budi Santoso" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Semester *</label>
                <select required value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                  <option value="">Pilih Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#4A90D9] hover:bg-blue-600 text-white rounded-lg">Simpan MK</button>
              </div>
            </form>
          </div>
        )}

        {/* Kolom Pencarian */}
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

        {/* Tampilan Folder Semester */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat...</p>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada Mata Kuliah</h3>
            <p className="text-gray-500 text-sm">Klik "Tambah MK" untuk memulai.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedSemesters.map(sem => (
              <div key={sem} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Folder Semester */}
                <div className="bg-[#1E3A5F] p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 text-white">
                    <FolderOpen size={20} className="text-yellow-300" />
                    <h2 className="font-bold text-lg">Semester {sem}</h2>
                  </div>
                  <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">
                    {groupedCourses[sem].length} Mata Kuliah
                  </span>
                </div>

                {/* Daftar MK di dalam Semester */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedCourses[sem].map(mk => (
                    <Link href={`/courses/${mk.id}`} key={mk.id} className="block p-4 rounded-xl border border-gray-100 hover:border-[#4A90D9] hover:bg-blue-50/30 transition-all group">
                      <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-[#1E3A5F] transition-colors">{mk.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">{mk.lecturer || 'Dosen belum diisi'}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat...</div>}>
      <CoursesContent />
    </Suspense>
  )
}