'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Wallet, TrendingDown, TrendingUp, Trash2, Target, PiggyBank, FileText } from 'lucide-react'
import Link from 'next/link'

type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

type SavingsGoal = {
  id: string
  goal_name: string
  target_amount: number
  current_amount: number
}

export default function FinancePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'transactions' | 'savings'>('transactions')
  const [loading, setLoading] = useState(true)

  // State Transaksi
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isTrxFormOpen, setIsTrxFormOpen] = useState(false)
  const [trxType, setTrxType] = useState<'income' | 'expense'>('expense')
  const [trxAmount, setTrxAmount] = useState('')
  const [trxCategory, setTrxCategory] = useState('Makanan')
  const [trxDesc, setTrxDesc] = useState('')
  const [trxDate, setTrxDate] = useState(new Date().toISOString().split('T')[0])

  // State Tabungan (Goals)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false)
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  
  const [addFundId, setAddFundId] = useState<string | null>(null)
  const [fundAmount, setFundAmount] = useState('')

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data: trxData } = await supabase
      .from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
    if (trxData) setTransactions(trxData)

    const { data: goalsData } = await supabase
      .from('savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (goalsData) setGoals(goalsData)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [router])

  // --- FUNGSI TRANSAKSI ---
  const handleSaveTrx = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const numericAmount = parseFloat(trxAmount.replace(/\./g, ''))
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id, type: trxType, amount: numericAmount, category: trxCategory, description: trxDesc, date: trxDate
    })

    if (!error) {
      setIsTrxFormOpen(false); setTrxAmount(''); setTrxDesc(''); fetchData()
    } else { alert('Gagal: ' + error.message) }
  }

  const handleDeleteTrx = async (id: string) => {
    if (!window.confirm('Hapus transaksi ini?')) return
    await supabase.from('transactions').delete().eq('id', id)
    fetchData()
  }

  const handleTrxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val) val = parseInt(val).toLocaleString('id-ID')
    setTrxAmount(val)
  }

  // --- FUNGSI TABUNGAN (GOALS) ---
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const numericTarget = parseFloat(goalTarget.replace(/\./g, ''))
    const { error } = await supabase.from('savings_goals').insert({
      user_id: user.id, goal_name: goalName, target_amount: numericTarget, current_amount: 0
    })

    if (!error) {
      setIsGoalFormOpen(false); setGoalName(''); setGoalTarget(''); fetchData()
    } else { alert('Gagal: ' + error.message) }
  }

  const handleAddFund = async (id: string, current: number) => {
    if (!fundAmount) return
    const numericFund = parseFloat(fundAmount.replace(/\./g, ''))
    const newAmount = current + numericFund

    const { error } = await supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', id)
    if (!error) {
      setAddFundId(null); setFundAmount(''); fetchData()
    } else { alert('Gagal menambah dana: ' + error.message) }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Hapus target tabungan ini?')) return
    await supabase.from('savings_goals').delete().eq('id', id)
    fetchData()
  }

  // --- HITUNG RINGKASAN ---
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-[#1E3A5F]" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Keuangan Saya</h1>
          </div>
          <Link href="/finance/report" className="flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <FileText size={16} /> Lihat Laporan
          </Link>
        </div>

        {/* Kartu Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#1E3A5F]"><Wallet size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Saldo</p>
              <h3 className="text-xl font-bold text-[#1E3A5F]">Rp {balance.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600"><TrendingUp size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pemasukan</p>
              <h3 className="text-xl font-bold text-green-600">Rp {totalIncome.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600"><TrendingDown size={24} /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pengeluaran</p>
              <h3 className="text-xl font-bold text-red-600">Rp {totalExpense.toLocaleString('id-ID')}</h3>
            </div>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 max-w-md">
          <button 
            onClick={() => setActiveTab('transactions')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-[#1E3A5F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Riwayat Transaksi
          </button>
          <button 
            onClick={() => setActiveTab('savings')} 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'savings' ? 'bg-[#1E3A5F] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Target Tabungan
          </button>
        </div>

        {/* --- KONTEN TAB TRANSAKSI --- */}
        {activeTab === 'transactions' && (
          <div className="animate-in fade-in">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsTrxFormOpen(!isTrxFormOpen)} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Plus size={16} /> Catat Transaksi
              </button>
            </div>

            {isTrxFormOpen && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <form onSubmit={handleSaveTrx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Jenis *</label>
                    <select value={trxType} onChange={e => setTrxType(e.target.value as 'income'|'expense')} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800">
                      <option value="expense">Pengeluaran</option>
                      <option value="income">Pemasukan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nominal (Rp) *</label>
                    <input type="text" required value={trxAmount} onChange={handleTrxAmountChange} placeholder="50.000" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
                    <select value={trxCategory} onChange={e => setTrxCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800">
                      <option value="Makanan">Makanan</option>
                      <option value="Transportasi">Transportasi</option>
                      <option value="Kuliah">Kuliah</option>
                      <option value="Gaji">Gaji / Uang Saku</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal *</label>
                    <input type="date" required value={trxDate} onChange={e => setTrxDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Catatan</label>
                    <input type="text" value={trxDesc} onChange={e => setTrxDesc(e.target.value)} placeholder="Beli makan siang" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsTrxFormOpen(false)} className="px-4 py-2 text-sm text-gray-600">Batal</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Simpan</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Keterangan</th>
                    <th className="px-6 py-4 font-semibold text-right">Nominal</th>
                    <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800 text-sm">{trx.category}</div>
                        <div className="text-xs text-gray-400">{trx.description || '-'}</div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteTrx(trx.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- KONTEN TAB TABUNGAN --- */}
        {activeTab === 'savings' && (
          <div className="animate-in fade-in">
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsGoalFormOpen(!isGoalFormOpen)} className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Plus size={16} /> Buat Target Baru
              </button>
            </div>

            {isGoalFormOpen && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <form onSubmit={handleSaveGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Target *</label>
                    <input type="text" required value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Misal: Beli Laptop Baru" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Target Dana (Rp) *</label>
                    <input type="text" required value={goalTarget} onChange={e => {
                      let val = e.target.value.replace(/\D/g, ''); if (val) val = parseInt(val).toLocaleString('id-ID'); setGoalTarget(val)
                    }} placeholder="10.000.000" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsGoalFormOpen(false)} className="px-4 py-2 text-sm text-gray-600">Batal</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Simpan Target</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map(goal => {
                const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                const isDone = goal.current_amount >= goal.target_amount
                
                return (
                  <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    {isDone && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Tercapai!</div>}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDone ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#1E3A5F]'}`}>
                        {isDone ? <Target size={20} /> : <PiggyBank size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{goal.goal_name}</h3>
                        <p className="text-xs text-gray-500">Target: Rp {goal.target_amount.toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className="mb-2 flex justify-between text-xs font-semibold">
                      <span className="text-[#4A90D9]">Terkumpul: Rp {goal.current_amount.toLocaleString('id-ID')}</span>
                      <span className="text-gray-500">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                      <div className={`h-3 rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : 'bg-[#4A90D9]'}`} style={{ width: `${percentage}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-50">
                      {addFundId === goal.id ? (
                        <div className="flex items-center gap-2 w-full">
                           <input type="text" value={fundAmount} onChange={(e) => {
                             let val = e.target.value.replace(/\D/g, ''); if (val) val = parseInt(val).toLocaleString('id-ID'); setFundAmount(val)
                           }} placeholder="Nominal" className="flex-1 px-2 py-1 text-sm border rounded text-gray-800" autoFocus />
                           <button onClick={() => handleAddFund(goal.id, goal.current_amount)} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">Simpan</button>
                           <button onClick={() => setAddFundId(null)} className="text-gray-400 text-xs px-2">Batal</button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setAddFundId(goal.id)} className="text-sm text-[#4A90D9] font-medium hover:underline flex items-center gap-1">
                            <Plus size={14} /> Tambah Dana
                          </button>
                          <button onClick={() => handleDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
              {goals.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <PiggyBank size={40} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-bold text-gray-700">Belum ada target tabungan</h3>
                  <p className="text-gray-500 text-sm">Klik "Buat Target Baru" untuk mulai menabung.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}