'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import Link from 'next/link'

type Course = {
  id: string
  name: string
  semester: number
}

function CoursesContent() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('courses')
      .select('id, name, semester')
      .eq('user_id', user.id)

    if (data) setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [router])

  // Mengelompokkan MK berdasarkan semester
  const groupedCourses = courses.reduce((acc: Record<number, Course[]>, course) => {
    const sem = course.semester || 1
    if (!acc[sem]) acc[sem] = []
    acc[sem].push(course)
    return acc
  }, {})

  const sortedSemesters = Object.keys(groupedCourses).map(Number).sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
            <ArrowLeft size={20} className="text-[#1E3A5F]" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Materi Kuliah</h1>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Memuat folder...</p>
        ) : sortedSemesters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada data</h3>
            <p className="text-gray-500 text-sm">Buka salah satu semester untuk mulai menambah MK.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedSemesters.map(sem => (
              <Link href={`/courses/${sem}`} key={sem} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#4A90D9] transition-all group flex flex-col items-center justify-center text-center h-40">
                <FolderOpen size={48} className="text-[#4A90D9] mb-3 group-hover:scale-110 transition-transform" fill="#E6F0FA" />
                <h3 className="font-bold text-gray-800 text-lg">Semester {sem}</h3>
                <p className="text-xs text-gray-500 mt-1">{groupedCourses[sem].length} Mata Kuliah</p>
              </Link>
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