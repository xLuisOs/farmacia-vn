import { useState, useEffect } from 'react'

const NAV = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard',          section: 'Menú principal' },
  { id: 'ventas',      icon: '🛒', label: 'Ventas',              section: null },
  { id: 'inventario',  icon: '📦', label: 'Inventario',          section: null, badge: '5', badgeColor: '#F59E0B' },
  { id: 'compras',     icon: '🏪', label: 'Compras',             section: null },
  { id: 'facturacion', icon: '🧾', label: 'Facturación',         section: null },
  { id: 'r-ventas',    icon: '📈', label: 'Ventas diarias',      section: 'Reportes' },
  { id: 'r-ingresos',  icon: '💰', label: 'Ingresos vs Egresos', section: null },
  { id: 'r-alertas',   icon: '⚠️', label: 'Alertas',             section: null, badge: '3', badgeColor: '#E05C6A' },
  { id: 'usuarios',    icon: '👥', label: 'Usuarios',            section: 'Admin' },
  { id: 'config',      icon: '⚙️', label: 'Configuración',       section: null },
]

const ROUTABLE = ['dashboard', 'ventas', 'inventario', 'compras', 'facturacion', 'usuarios']

export default function Layout({ activePage, setActivePage, children, user, onLogout }) {
  const [clock, setClock] = useState('')

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── TITLEBAR ── */}
      <div style={{
        background: 'linear-gradient(90deg, #1A3A5C 0%, #2A5278 100%)',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '2px solid #5BBFCC',
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

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 230,
          background: 'linear-gradient(180deg, #1A3A5C 0%, #224868 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 0',
          flexShrink: 0,
          borderRight: '1px solid rgba(91,191,204,.2)',
          overflowY: 'auto',
        }}>
          {NAV.map((item) => {
            const isActive = activePage === item.id
            return (
              <div key={item.id}>
                {item.section && (
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#6A9BB5', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 16px 6px', marginTop: 10 }}>
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
                    background: isActive ? 'rgba(43,197,212,.12)' : 'transparent',
                    margin: '1px 0',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.05)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: isActive ? 'rgba(43,197,212,.2)' : 'rgba(255,255,255,.06)' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: isActive ? '#7FD4DE' : '#a0b3d6' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={{ marginLeft: 'auto', background: item.badgeColor, color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#5BBFCC,#3A6E9E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                {getInitials(user?.nombre_completo)}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#cdd8ee' }}>{user?.nombre_completo || 'Usuario'}</div>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#5BBFCC', background: 'rgba(43,197,212,.15)', padding: '1px 6px', borderRadius: 4, display: 'inline-block', marginTop: 2 }}>
                  {user?.rol?.toUpperCase() || 'ROL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, background: '#F0F8FA', overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>

      </div>
    </div>
  )
}