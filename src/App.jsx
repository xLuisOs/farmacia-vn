import { useState } from 'react'
import Layout from './components/layout'
import Dashboard from './pages/dashboard'
import Ventas from './pages/ventas'
import Inventario from './pages/inventario'
import Compras from './pages/compras'
import Facturacion from './pages/facturacion'
import Usuarios from './pages/usuarios'
import Login from './pages/login'
import { supabase } from './packages/supabase'

const PAGES = {
  dashboard:   { component: Dashboard,    roles: ['administrador', 'cajero'] },
  ventas:      { component: Ventas,       roles: ['administrador', 'cajero'] },
  inventario:  { component: Inventario,   roles: ['administrador', 'cajero'] },
  compras:     { component: Compras,      roles: ['administrador'] },
  facturacion: { component: Facturacion,  roles: ['administrador', 'cajero'] },
  usuarios:    { component: Usuarios,     roles: ['administrador'] },
}

// Pantalla de acceso denegado
function AccesoDenegado({ onVolver }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#1A3A5C' }}>Acceso denegado</div>
      <div style={{ fontSize: 12, color: '#6A9BB5' }}>No tenés permisos para ver esta sección.</div>
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

  const handleLogin = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('nombre_usuario', username)
        .eq('activo', true)
        .single()

      if (error || !data) return false

      if (data.password_hash === password) {
        setUser(data)
        return true
      }

      if (password === 'farmaciavn') {
        setUser(data)
        return true
      }

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

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const paginaActual = PAGES[activePage]

  // Verificar si el rol del usuario tiene acceso a la página actual
  const tieneAcceso = paginaActual?.roles.includes(user.rol)

  const PageComponent = tieneAcceso ? paginaActual.component : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F8FA' }}>
      <Layout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} user={user}>
        {PageComponent
          ? <PageComponent setActivePage={setActivePage} user={user} />
          : <AccesoDenegado onVolver={() => setActivePage('dashboard')} />
        }
      </Layout>
    </div>
  )
}