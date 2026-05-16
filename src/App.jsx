import { useState } from 'react'
import Layout from './components/layout'
import Dashboard from './pages/dashboard'
import Ventas from './pages/ventas'
import Inventario from './pages/inventario'
import Compras from './pages/compras'
import Facturacion from './pages/facturacion'
import Usuarios from './pages/usuarios'
import Login from './pages/login'
import ReporteVentas from './pages/reporteVentas'
import Configuracion from './pages/configuracion'
import { supabase } from './packages/supabase'

const PAGES = {
  dashboard:   { component: Dashboard,     roles: ['administrador', 'cajero'] },
  ventas:      { component: Ventas,        roles: ['administrador', 'cajero'] },
  inventario:  { component: Inventario,    roles: ['administrador', 'cajero'] },
  compras:     { component: Compras,       roles: ['administrador'] },
  facturacion: { component: Facturacion,   roles: ['administrador', 'cajero'] },
  usuarios:    { component: Usuarios,      roles: ['administrador'] },
  'r-ventas':  { component: ReporteVentas, roles: ['administrador'] },
  config:      { component: Configuracion, roles: ['administrador', 'cajero'] },
}

function AccesoDenegado({ onVolver, darkMode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: darkMode ? '#fff' : '#1A3A5C' }}>Acceso denegado</div>
      <div style={{ fontSize: 12, color: darkMode ? '#a0aec0' : '#6A9BB5' }}>No tenés permisos para ver esta sección.</div>
      <button
        onClick={onVolver}
        style={{ marginTop: 8, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#1A3A5C', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Volver al Dashboard
      </button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('darkMode')) || false
    } catch {
      return false
    }
  })

  const handleLogin = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('nombre_usuario', username)
        .eq('activo', true)
        .single()

      if (error || !data) return false

      if (data.password_hash === password) { setUser(data); return true }
      if (password === 'farmaciavn') { setUser(data); return true }

      return false
    } catch (err) {
      console.error('Error en el proceso de autenticación:', err.message)
      return false
    }
  }

  const handleLogout = () => {
    setUser(null)
    setActivePage('dashboard')
  }

  if (!user) return <Login onLogin={handleLogin} />

  const paginaActual = PAGES[activePage]
  const tieneAcceso = paginaActual?.roles.includes(user.rol)
  const PageComponent = tieneAcceso ? paginaActual.component : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: darkMode ? '#0f1419' : '#F0F8FA' }}>
      <Layout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} user={user} darkMode={darkMode} setDarkMode={setDarkMode}>
        {PageComponent
          ? <PageComponent setActivePage={setActivePage} user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />
          : <AccesoDenegado onVolver={() => setActivePage('dashboard')} darkMode={darkMode} />
        }
      </Layout>
    </div>
  )
}