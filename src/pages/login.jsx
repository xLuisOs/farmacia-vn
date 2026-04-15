import { useState } from 'react'
import logo from '../assets/logo_farmaciavn.jpeg'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const success = await onLogin(username, password)
    
    if (!success) {
      setError("Usuario o contraseña incorrectos.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F0F8FA] flex items-center justify-center p-4 font-outfit">
      <div className="bg-white p-10 rounded-2xl border-[1.5px] border-[#E2F0F4] shadow-lg w-full max-w-md">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <img src={logo} alt="Logo Farmacia" className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-[#5BBFCC]" />
          <h1 className="text-3xl font-extrabold text-[#1A3A5C]">
            Farmacia <span className="text-[#5BBFCC]">Villa Norte</span>
          </h1>
          <p className="text-sm text-[#6A9BB5] mt-1.5 font-medium">Sistema de Gestión Institucional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#1A3A5C] tracking-widest mb-2" htmlFor="username">
              USUARIO
            </label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-[1.5px] border-[#E2F0F4] text-sm focus:border-[#5BBFCC] focus:ring-1 focus:ring-[#5BBFCC] transition outline-none" 
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A3A5C] tracking-widest mb-2" htmlFor="password">
              CONTRASEÑA
            </label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-[1.5px] border-[#E2F0F4] text-sm focus:border-[#5BBFCC] focus:ring-1 focus:ring-[#5BBFCC] transition outline-none" 
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold text-center border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3.5 rounded-lg text-sm font-bold text-white transition duration-300 flex items-center justify-center gap-2 
              ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-[#1A3A5C] to-[#2A5278] hover:scale-[1.02] shadow-sm hover:shadow-md'}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            ) : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-[#E2F0F4] pt-4">
          <p className="text-[10px] font-bold text-[#8fa3c8] uppercase tracking-tighter">
            Quetzaltenango, Guatemala • 2026
          </p>
        </div>
      </div>
    </div>
  )
}