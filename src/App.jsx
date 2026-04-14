import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ventas from './pages/Ventas'
import Inventario from './pages/Inventario'
import Compras from './pages/Compras'
import Facturacion from './pages/Facturacion'
import Usuarios from './pages/Usuarios'

const PAGES = {
  dashboard: Dashboard,
  ventas: Ventas,
  inventario: Inventario,
  compras: Compras,
  facturacion: Facturacion,
  usuarios: Usuarios,
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const PageComponent = PAGES[activePage] || Dashboard

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0F8FA' }}>
      <Layout activePage={activePage} setActivePage={setActivePage}>
        <PageComponent setActivePage={setActivePage} />
      </Layout>
    </div>
  )
}