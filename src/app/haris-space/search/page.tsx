'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Search, Loader2, ArrowRight, Wallet, BookOpen, UserCircle, Image as ImageIcon, ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

type SearchResult = {
  id: string
  type: string
  title: string
  subtitle: string
  url: string
}

export default function HarisSpaceSearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    setHasSearched(true)
    setResults([])

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const searchTerm = `%${query}%`
    const tempResults: SearchResult[] = []

    try {
      const { data: trx } = await supabase.from('transactions').select('id, category, description').eq('user_id', user.id).or(`category.ilike.${searchTerm},description.ilike.${searchTerm}`).limit(3)
      if (trx) trx.forEach(t => tempResults.push({ id: t.id, type: 'Keuangan', title: t.category, subtitle: t.description || 'Transaksi', url: '/finance' }))

      const { data: acc } = await supabase.from('accounts').select('id, app_name, email_username').eq('user_id', user.id).or(`app_name.ilike.${searchTerm},email_username.ilike.${searchTerm}`).limit(3)
      if (acc) acc.forEach(a => tempResults.push({ id: a.id, type: 'Akun', title: a.app_name, subtitle: a.email_username, url: '/accounts' }))

      const { data: jrn } = await supabase.from('daily_journals').select('id, activity_name, notes').eq('user_id', user.id).or(`activity_name.ilike.${searchTerm},notes.ilike.${searchTerm}`).limit(3)
      if (jrn) jrn.forEach(j => tempResults.push({ id: j.id, type: 'Jurnal', title: j.activity_name, subtitle: j.notes || 'Catatan Harian', url: '/journal' }))

      const { data: shop } = await supabase.from('shopping_history').select('id, item_name, store_name').eq('user_id', user.id).or(`item_name.ilike.${searchTerm},store_name.ilike.${searchTerm}`).limit(3)
      if (shop) shop.forEach(s => tempResults.push({ id: s.id, type: 'Belanja', title: s.item_name, subtitle: s.store_name || 'Pembelian', url: '/shopping' }))

      setResults(tempResults)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Keuangan': return <Wallet size={18} className="text-green-600" />
      case 'Akun': return <UserCircle size={18} className="text-blue-600" />
      case 'Jurnal': return <BookOpen size={18} className="text-purple-600" />
      case 'Belanja': return <ShoppingBag size={18} className="text-orange-600" />
      default: return <Search size={18} className="text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/haris-space" className="inline-flex items-center gap-2 mb-8 text-[#1E3A5F] font-bold hover:underline">
          <ArrowLeft size={20}/> Kembali ke Haris Space
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A5F] rounded-xl mb-3 shadow-lg">
            <Search size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Pencarian Cepat</h1>
          <p className="text-gray-500 text-sm">Temukan data di seluruh fitur HarisHub secara instan.</p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-8 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {searching ? <Loader2 size={20} className="text-[#4A90D9] animate-spin" /> : <Search size={20} className="text-gray-400 group-focus-within:text-[#4A90D9] transition-colors" />}
          </div>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari apa saja... (Misal: 'Motor', 'Password', 'Kopi')"
            className="w-full pl-12 pr-28 py-4 text-base rounded-xl border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent transition-all bg-white text-gray-800"
          />
          <button type="submit" className="absolute inset-y-1.5 right-1.5 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-5 rounded-lg font-medium transition-colors text-sm">
            Cari
          </button>
        </form>

        {hasSearched && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
            {searching ? (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                <Loader2 size={32} className="animate-spin text-[#4A90D9] mb-4" />
                <p>Mencari di seluruh gudang datamu...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-10 text-center">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-700">Tidak ditemukan</h3>
                <p className="text-sm text-gray-500">Tidak ada data yang cocok dengan kata kunci "{query}".</p>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ditemukan {results.length} hasil</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {results.map((res, index) => (
                    <Link href={res.url} key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          {getIcon(res.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{res.type}</span>
                          </div>
                          <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#4A90D9] transition-colors">{res.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{res.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 group-hover:text-[#4A90D9] group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}