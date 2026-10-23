'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, PenLine, MapPin, Calendar, BookOpen, Smile, Meh, Frown } from 'lucide-react'
import Link from 'next/link'

export default function JournalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [journalId, setJournalId] = useState<string | null>(null)

  // State Form
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [activity, setActivity] = useState('')
  const [category, setCategory] = useState('Kuliah')
  const [customCategory, setCustomCategory] = useState('')
  const [location, setLocation] = useState('')
  const [mood, setMood] = useState('Netral')
  const [notes, setNotes] = useState('')

  const checkTodayJournal = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('daily_journals')
      .select('*')
      .eq('user_id', user.id)
      .eq('journal_date', today)
      .single()

    if (data) {
      setJournalId(data.id)
      setActivity(data.activity_name)
      setCategory(data.category)
      setLocation(data.location || '')
      setMood(data.mood || 'Netral')
      setNotes(data.notes || '')
      setIsSaved(true)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkTodayJournal()
  }, [router, today])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const finalCategory = category === 'Lainnya' ? customCategory : category

    const payload = {
      user_id: user.id,
      journal_date: today,
      activity_name: activity,
      category: finalCategory,
      location,
      mood,
      notes
    }

    let error;
    if (journalId) {
      // Update jika sudah ada
      const { error: err } = await supabase.from('daily_journals').update(payload).eq('id', journalId)
      error = err
    } else {
      // Insert jika baru
      const { error: err } = await supabase.from('daily_journals').insert(payload)
      error = err
    }

    if (!error) {
      setIsSaved(true)
      window.location.reload() // Refresh agar dashboard tahu jurnal sudah diisi
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-[#1E3A5F] font-bold hover:underline">
          <ArrowLeft size={20}/> Kembali ke Dashboard
        </Link>

        {/* HEADER PERSONAL */}
        <div className="bg-[#1E3A5F] rounded-2xl p-6 md:p-8 text-white mb-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-white text-[#1E3A5F] rounded-full flex items-center justify-center text-2xl font-bold border-4 border-[#4A90D9]">
              HS
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Jurnal Harian</h1>
              <p className="text-blue-200 mt-1">Haris Rizki Saefullah</p>
            </div>
          </div>
        </div>

        {/* KONTEN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <BookOpen className="text-[#4A90D9]" />
            <h2 className="text-xl font-bold text-gray-800">
              {isSaved ? 'Jurnal Hari Ini (Selesai)' : 'Tulis Kegiatan Hari Ini'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Tanggal & Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                  <Calendar size={18} className="text-gray-400 mr-2" />
                  <input type="date" value={date} disabled className="bg-transparent text-gray-600 w-full outline-none cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Kegiatan</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800">
                  <option value="Kuliah">Kuliah</option>
                  <option value="Belajar">Belajar Mandiri</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Nongkrong">Nongkrong / Sosial</option>
                  <option value="Lainnya">Lainnya (Isi Manual)</option>
                </select>
                {category === 'Lainnya' && (
                  <input type="text" required value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Ketik kategori custom..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 mt-2" />
                )}
              </div>
            </div>

            {/* Kegiatan Utama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Utama Hari Ini *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#4A90D9] transition-all bg-white">
                <PenLine size={18} className="text-gray-400 mr-2" />
                <input type="text" required value={activity} onChange={e => setActivity(e.target.value)} placeholder="Contoh: Belajar Pemrograman Web di Kampus" className="bg-transparent w-full outline-none text-sm text-gray-800" />
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#4A90D9] transition-all bg-white">
                <MapPin size={18} className="text-gray-400 mr-2" />
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Contoh: Kampus, Perpustakaan, Rumah" className="bg-transparent w-full outline-none text-sm text-gray-800" />
              </div>
            </div>

            {/* Mood Formal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bagaimana Perasaanmu Hari Ini?</label>
              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setMood('Produktif')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${mood === 'Produktif' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                  <Smile size={24} className="mb-1" /> <span className="text-xs font-bold">Produktif</span>
                </button>
                <button type="button" onClick={() => setMood('Netral')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${mood === 'Netral' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
                  <Meh size={24} className="mb-1" /> <span className="text-xs font-bold">Netral</span>
                </button>
                <button type="button" onClick={() => setMood('Lelah')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${mood === 'Lelah' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-300'}`}>
                  <Frown size={24} className="mb-1" /> <span className="text-xs font-bold">Lelah</span>
                </button>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Cerita Hari Ini)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Tulis pengalaman menarik, pelajaran, atau hal yang kamu syukuri hari ini..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:ring-2 focus:ring-[#4A90D9] outline-none"></textarea>
            </div>

            <button type="submit" className="w-full bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white font-bold py-3 rounded-xl transition-colors">
              {isSaved ? 'Perbarui Jurnal Hari Ini' : 'Simpan Jurnal Hari Ini'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}