import { useState, useEffect } from 'react'

const NAV = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard',          section: 'Menú principal', roles: ['administrador', 'cajero'] },
  { id: 'ventas',      icon: '🛒', label: 'Ventas',              section: 'Menú principal', roles: ['administrador', 'cajero'] },
  { id: 'inventario',  icon: '📦', label: 'Inventario',          section: 'Menú principal', roles: ['administrador', 'cajero'] },
  { id: 'compras',     icon: '🏪', label: 'Compras',             section: 'Menú principal', roles: ['administrador'] },
  { id: 'facturacion', icon: '🧾', label: 'Facturación',         section: 'Menú principal', roles: ['administrador', 'cajero'] },
  { id: 'r-ventas',    icon: '📈', label: 'Ventas diarias',      section: 'Reportes',       roles: ['administrador'] },
  { id: 'r-ingresos',  icon: '💰', label: 'Ingresos vs Egresos', section: 'Reportes',       roles: ['administrador'] },
  { id: 'r-alertas',   icon: '⚠️', label: 'Alertas',             section: 'Reportes',       roles: ['administrador'] },
  { id: 'usuarios',    icon: '👥', label: 'Usuarios',            section: 'Admin',          roles: ['administrador'] },
  { id: 'config',      icon: '⚙️', label: 'Configuración',       section: 'Admin',          roles: ['administrador', 'cajero'] },
]

const ROUTABLE = ['dashboard', 'ventas', 'inventario', 'compras', 'facturacion', 'usuarios', 'r-ventas', 'config']

export default function Layout({ activePage, setActivePage, children, user, onLogout, darkMode, setDarkMode }) {
  const [clock, setClock] = useState('')

  const getInitials = (name) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const navFiltrado = NAV.filter(item => item.roles.includes(user?.rol))

  // Colores dinámicos según modo oscuro
  const colors = {
    titlebarBg: 'linear-gradient(90deg, #1A3A5C 0%, #2A5278 100%)',
    titlebarDarkBg: 'linear-gradient(90deg, #0f1419 0%, #1a2332 100%)',
    sidebarBg: 'linear-gradient(180deg, #1A3A5C 0%, #224868 100%)',
    sidebarDarkBg: 'linear-gradient(180deg, #0f1419 0%, #1a2332 100%)',
    contentBg: '#F0F8FA',
    contentDarkBg: '#1a1f2e',
    textPrimary: '#1A3A5C',
    textPrimaryDark: '#ffffff',
    textSecondary: '#6A9BB5',
    textSecondaryDark: '#a0aec0',
    cardBg: '#ffffff',
    cardDarkBg: '#2d3748',
    borderLight: '#E2F0F4',
    borderDark: '#3f4d5f',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: darkMode ? colors.contentDarkBg : colors.contentBg }}>

      {/* ── TITLEBAR ── */}
      <div style={{
        background: darkMode ? colors.titlebarDarkBg : colors.titlebarBg,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: `2px solid ${darkMode ? '#2BC5D4' : '#5BBFCC'}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5BBFCC, #1a7fc1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: 'white', fontWeight: 700,
          }}>⚕</div>
          <div>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Sistema de Gestión – Farmacia Villa Norte</div>
            <div style={{ color: '#7FD4DE', fontSize: 10 }}>Dashboard principal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#8fa3c8', fontSize: 10 }}>🕐 {clock}</span>
          <div
            onClick={onLogout}
            title="Cerrar Sesión"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.08)', borderRadius: 20, padding: '4px 10px 4px 6px', cursor: 'pointer' }}
          >
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#2BC5D4,#1a7fc1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>
              {getInitials(user?.nombre_completo)}
            </div>
            <div>
              <div style={{ color: '#cdd8ee', fontSize: 10 }}>{user?.nombre_completo || 'Usuario'}</div>
              <div style={{ color: '#5BBFCC', fontSize: 9, fontWeight: 600 }}>{user?.rol?.toUpperCase() || 'ROL'}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 230,
          flex: '0 0 230px',
          height: '100%',
          background: darkMode ? colors.sidebarDarkBg : colors.sidebarBg,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '16px',
          paddingBottom: '16px',
          borderRight: `1px solid ${darkMode ? 'rgba(43,197,212,.1)' : 'rgba(91,191,204,.2)'}`,
          boxSizing: 'border-box',
        }}>
          {navFiltrado.map((item, index) => {
            const isActive = activePage === item.id
            const seccionAnterior = index > 0 ? navFiltrado[index - 1].section : null
            const mostrarSeccion = item.section !== seccionAnterior

            return (
              <div key={item.id}>
                {mostrarSeccion && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: darkMode ? '#708090' : '#6A9BB5', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 16px 6px', marginTop: index === 0 ? 0 : 10 }}>
                    {item.section}
                  </div>
                )}
                <div
                  onClick={() => ROUTABLE.includes(item.id) && setActivePage(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 16px',
                    cursor: ROUTABLE.includes(item.id) ? 'pointer' : 'default',
                    borderLeft: isActive ? '3px solid #5BBFCC' : '3px solid transparent',
                    background: isActive ? (darkMode ? 'rgba(43,197,212,.1)' : 'rgba(43,197,212,.12)') : 'transparent',
                    margin: '1px 0',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: isActive ? (darkMode ? 'rgba(43,197,212,.15)' : 'rgba(43,197,212,.2)') : (darkMode ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.06)') }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: isActive ? '#7FD4DE' : (darkMode ? '#cbd5e1' : '#a0b3d6') }}>
                    {item.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── CONTENIDO ── */}
        <div style={{ flex: 1, background: darkMode ? colors.contentDarkBg : colors.contentBg, overflowY: 'auto', padding: 18 }}>
          {children}
        </div>

      </div>
    </div>
  )
}