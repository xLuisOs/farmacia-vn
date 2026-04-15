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
  dashboard: Dashboard,
  ventas: Ventas,
  inventario: Inventario,
  compras: Compras,
  facturacion: Facturacion,
  usuarios: Usuarios,
}

export default function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')

  const handleLogin = async (username, password) => {
    try {
      // Buscamos al usuario en el esquema 'farmacia'
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('nombre_usuario', username)
        .eq('activo', true)
        .single()

      if (error || !data) return false

      // Comprobación de contraseña (comparación directa para testadmin)
      if (data.password_hash === password) {
        setUser(data)
        return true
      }

      // Mantenemos el bypass por si quieres seguir usando admin/farmaciavn
      if (password === 'farmaciavn') {
        setUser(data)
        return true
      }

      return false
    } catch (err) {
      console.error("Error en el proceso de autenticación:", err.message)
      return false
    }
  }

  const handleLogout = () => {
    setUser(null)
    setActivePage('dashboard')
  }

  // Renderizado condicional: si no hay sesión, muestra el Login
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // Si hay sesión, usamos tu estructura original que mantiene lo visual centrado
  const PageComponent = PAGES[activePage] || Dashboard

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F8FA' }}>
      <Layout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} user={user}>
        <PageComponent setActivePage={setActivePage} />
      </Layout>
    </div>
  )
}