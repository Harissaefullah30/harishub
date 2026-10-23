'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { 
  LayoutDashboard, 
  UserCircle, 
  BookOpen, 
  Car, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Menu, 
  Wallet, 
  BellRing, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Receipt, 
  Sparkles, 
  Search,
  HeartPulse 
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // State Profil
  const [userName, setUserName] = useState('Haris')
  const [userBio, setUserBio] = useState('Digital Builder & Creator')
  const [initial, setInitial] = useState('HS')

  // State Jurnal
  const [hasJournalToday, setHasJournalToday] = useState(true)
  const [checkingJournal, setCheckingJournal] = useState(true)

  // State Pencarian Menu
  const [searchMenu, setSearchMenu] = useState('')

  useEffect(() => {
    setCurrentTime(new Date())
    const checkUserAndJournal = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/')

      // Ambil data nama & bio dari user_metadata (yang diatur di halaman Pengaturan)
      const meta = session.user.user_metadata
      if (meta) {
        const name = meta.full_name || 'Haris Rizki Saefullah'
        setUserName(name)
        setUserBio(meta.bio || 'Digital Builder & Creator')
        
        // Buat inisial otomatis (2 huruf pertama)
        const nameParts = name.split(' ')
        if (nameParts.length > 1) {
          setInitial((nameParts[0][0] + nameParts[1][0]).toUpperCase())
        } else {
          setInitial(name.substring(0, 2).toUpperCase())
        }
      }

      // Cek Jurnal
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_journals')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('journal_date', today)
        .single()

      setHasJournalToday(!!data)
      setCheckingJournal(false)
    }
    
    checkUserAndJournal()
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getGreeting = () => {
    if (!currentTime) return 'Halo'
    const hour = currentTime.getHours()
    if (hour < 11) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 19) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--'
    return date.toLocaleTimeString('id-ID', { hour12: false })
  }

  // Daftar Menu
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Jurnal Harian', path: '/journal', icon: BookOpen },
    { name: 'Keuangan', path: '/finance', icon: Wallet },
    { name: 'Kesehatan & Fisik', path: '/health', icon: HeartPulse },
    { name: 'Haris Space', path: '/haris-space', icon: Sparkles, special: true },
    { name: 'Akun & Password', path: '/accounts', icon: UserCircle },
    { name: 'Materi Kuliah', path: '/courses', icon: BookOpen },
    { name: 'Kendaraan', path: '/vehicles', icon: Car },
    { name: 'Riwayat Belanja', path: '/shopping', icon: ShoppingBag },
    { name: 'Kwitansi & Bukti', path: '/receipts', icon: Receipt },
    { name: 'Link Penting', path: '/links', icon: LinkIcon },
    { name: 'Galeri Foto & Video', path: '/gallery', icon: ImageIcon },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ]

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchMenu.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col md:flex-row">
      
      {/* HEADER KHUSUS HP */}
      <div className="md:hidden bg-[#1E3A5F] text-white p-4 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-[#1E3A5F] rounded-lg flex items-center justify-center font-bold text-sm">
            {initial}
          </div>
          <span className="font-bold">HarisHub</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        ${isSidebarOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-[#1E3A5F] text-white shadow-xl absolute md:relative z-10 top-16 md:top-0 h-[calc(100vh-64px)] md:h-screen
      `}>
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-[#2E5A8A] shrink-0">
          <div className="w-10 h-10 bg-white text-[#1E3A5F] rounded-lg flex items-center justify-center font-bold text-xl">
            {initial}
          </div>
          <span className="font-bold text-lg tracking-wide">HarisHub</span>
        </div>

        {/* KOLOM PENCARIAN MENU */}
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari fitur..." 
              value={searchMenu}
              onChange={e => setSearchMenu(e.target.value)}
              className="w-full bg-[#2E5A8A] text-white text-sm rounded-lg pl-9 pr-3 py-2 outline-none placeholder-gray-400 focus:ring-1 focus:ring-[#4A90D9] transition-all"
            />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => {
              const Icon = item.icon
              const isActive = item.path === '/dashboard'
              
              return (
                <Link 
                  key={item.name}
                  href={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#2E5A8A]' 
                      : item.special 
                        ? 'text-yellow-300 hover:bg-[#2E5A8A] hover:text-white' 
                        : 'hover:bg-[#2E5A8A]'
                  }`}
                >
                  <Icon size={18} /> {item.name} {item.special && '✨'}
                </Link>
              )
            })
          ) : (
            <p className="text-center text-gray-400 text-sm py-4">Fitur tidak ditemukan.</p>
          )}
        </nav>

        <div className="p-4 border-t border-[#2E5A8A] shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full hover:bg-red-500 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-red-100 hover:text-white">
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="hidden md:flex bg-white h-16 border-b border-gray-200 items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-[#1E3A5F]">Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Halo, {userName.split(' ')[0]}!</span>
            <div className="w-8 h-8 bg-[#1E3A5F] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
              {initial}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          
          {/* PENGINGAT JURNAL HARIAN */}
          {!checkingJournal && !hasJournalToday && (
            <div className="mb-6">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                    <BellRing size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-800">Kamu belum mengisi Jurnal Hari Ini!</h3>
                    <p className="text-sm text-orange-600">Yuk, luangkan waktu 1 menit untuk mencatat kegiatanmu hari ini.</p>
                  </div>
                </div>
                <Link href="/journal" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
                  Isi Jurnal Sekarang
                </Link>
              </div>
            </div>
          )}

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-1">{getGreeting()}, {userName.split(' ')[0]}! 👋</h1>
            <p className="text-sm md:text-base text-gray-500">Selamat datang kembali di pusat datamu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
            
            {/* Kotak 1: Jam Dinding */}
            <div className="md:col-span-2 bg-[#1E3A5F] p-6 md:p-8 rounded-2xl shadow-lg text-white relative overflow-hidden flex flex-col justify-center h-40 md:h-48">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-tr-full"></div>
              <p className="text-[10px] md:text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1 md:mb-2">Waktu Saat Ini</p>
              <h2 className="text-5xl md:text-6xl font-light tracking-tighter tabular-nums drop-shadow-md">{formatTime(currentTime)}</h2>
            </div>

            {/* Kotak 2: Profil */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-40 md:h-48 justify-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-[#4A90D9]"></div>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#1E3A5F] text-xl md:text-2xl font-bold mb-2 md:mb-3 border-2 border-[#1E3A5F]">
                {initial}
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-lg leading-tight">{userName}</h3>
              <p className="text-[10px] md:text-xs text-[#4A90D9] font-medium mt-1 mb-2">{userBio}</p>
            </div>

            {/* Kotak 3: Kalender Mini */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="font-bold text-[#1E3A5F] text-xs md:text-sm">📅 Kalender</h3>
                <span className="text-[10px] font-bold text-[#4A90D9] uppercase tracking-wide">
                  {currentTime ? currentTime.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                  <div key={i} className="text-[9px] md:text-[10px] text-gray-400 font-bold">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(date => (
                  <div 
                    key={date} 
                    className={`py-1 text-[10px] md:text-[11px] font-medium rounded-md transition-all cursor-pointer flex items-center justify-center
                      ${currentTime && date === currentTime.getDate() 
                        ? 'bg-[#1E3A5F] text-white shadow-sm scale-110' 
                        : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {date}
                  </div>
                ))}
              </div>
            </div>

            {/* Kotak 4: Prinsip */}
            <div className="md:col-span-2 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center min-h-[100px] md:min-h-[120px]">
              <div className="w-1.5 h-10 md:h-12 bg-[#4A90D9] rounded-full mr-4 md:mr-5"></div>
              <div>
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Prinsip Hari Ini</p>
                <h3 className="text-xs md:text-sm font-medium text-gray-700 italic">"Bangun sistemmu hari ini, agar kamu bebas berkreasi esok hari."</h3>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}