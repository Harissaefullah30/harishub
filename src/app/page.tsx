import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      {/* Kartu Login */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        
        {/* Logo Inisial HS */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#1E3A5F] rounded-xl flex items-center justify-center text-white text-2xl font-bold tracking-wider">
            HS
          </div>
        </div>

        {/* Judul */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">Selamat Datang</h1>
          <p className="text-gray-500 text-sm">HarisHub: Semua di sini.</p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="haris@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent transition-all"
            />
          </div>

          <button 
            type="button" 
            className="w-full bg-[#1E3A5F] hover:bg-[#2E5A8A] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200"
          >
            Masuk
          </button>
        </form>

        {/* Footer Form */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Belum punya akun? <a href="#" className="text-[#4A90D9] hover:underline font-medium">Daftar</a></p>
        </div>

      </div>
    </div>
  );
}