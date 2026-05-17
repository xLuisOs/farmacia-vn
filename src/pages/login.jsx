import { useState, useEffect, useRef } from 'react'
import logo from '../assets/logo_farmaciavn.jpeg'

function AnimatedBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = [
      'rgba(62, 181, 198, 0.40)',
      'rgba(15, 39, 68, 0.18)',
      'rgba(42, 139, 181, 0.30)',
      'rgba(94, 207, 223, 0.35)',
      'rgba(26, 58, 92, 0.15)',
    ]

    const bubbles = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 60 + 20,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      bubbles.forEach((b) => {
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.fill()

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(62, 181, 198, 0.20)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        b.x += b.dx
        b.y += b.dy

        if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1
        if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}

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
    if (!success) setError('Usuario o contraseña incorrectos.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F0F8FA] flex items-center justify-center p-4 font-outfit relative">

      <AnimatedBackground />

      <div className="relative z-10 bg-white/80 backdrop-blur-md p-10 rounded-2xl border-[1.5px] border-[#E2F0F4] shadow-lg w-full max-w-md">

        <div className="flex flex-col items-center mb-10 text-center">
          <img src={logo} alt="Logo Farmacia" className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-[#3eb5c6]" />
          <h1 className="text-3xl font-extrabold text-[#0f2744]">
            Farmacia <span className="text-[#3eb5c6]">Villa Norte</span>
          </h1>
          <p className="text-sm text-[#2a8bb5] mt-1.5 font-medium">Sistema de Gestión Institucional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#0f2744] tracking-widest mb-2" htmlFor="username">
              USUARIO
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-[1.5px] border-[#E2F0F4] text-sm focus:border-[#3eb5c6] focus:ring-1 focus:ring-[#3eb5c6] transition outline-none bg-white/90"
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0f2744] tracking-widest mb-2" htmlFor="password">
              CONTRASEÑA
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-[1.5px] border-[#E2F0F4] text-sm focus:border-[#3eb5c6] focus:ring-1 focus:ring-[#3eb5c6] transition outline-none bg-white/90"
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
              ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-[#0f2744] to-[#2a8bb5] hover:scale-[1.02] shadow-sm hover:shadow-md'}`}
          >
            {loading
              ? <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              : 'INICIAR SESIÓN'
            }
          </button>
        </form>

        <div className="mt-10 text-center border-t border-[#E2F0F4] pt-4">
          <p className="text-[10px] font-bold text-[#2a8bb5] uppercase tracking-tighter">
            Quetzaltenango, Guatemala • 2026
          </p>
        </div>
      </div>
    </div>
  )
}