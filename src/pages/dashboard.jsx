import { useState, useEffect } from 'react'
import {
  FiPackage, FiTrendingUp, FiAlertTriangle,
  FiCalendar, FiShoppingCart, FiArrowUpRight
} from 'react-icons/fi'
import { supabase } from '../packages/supabase'

export default function Dashboard({ darkMode }) {
  const [stats, setStats] = useState({ ventasDia: 0, ingresosDia: 0, bajoStock: 0, porVencer: 0 })
  const [productosBajoStock, setProductosBajoStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const hoy = new Date().toISOString().split('T')[0]
      const proximoMes = new Date()
      proximoMes.setDate(proximoMes.getDate() + 30)
      const fechaLimite = proximoMes.toISOString().split('T')[0]

      const { data: stockData, count: bajoStockCount } = await supabase
        .schema('farmacia').from('vista_stock_actual')
        .select('producto, stock_actual, stock_minimo', { count: 'exact' })
        .eq('alerta_stock_bajo', true).limit(5)

      const { count: vencerCount } = await supabase
        .schema('farmacia').from('lote')
        .select('*', { count: 'exact', head: true })
        .lte('fecha_vencimiento', fechaLimite)
        .gte('fecha_vencimiento', hoy)

      const { data: ventasData } = await supabase
        .schema('farmacia').from('venta').select('total')
        .gte('fecha', `${hoy}T00:00:00`)
        .lte('fecha', `${hoy}T23:59:59`)

      setStats({
        ventasDia: ventasData?.length || 0,
        ingresosDia: ventasData?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0,
        bajoStock: bajoStockCount || 0,
        porVencer: vencerCount || 0
      })
      setProductosBajoStock(stockData || [])
    } catch (error) {
      console.error('Error cargando dashboard:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: darkMode ? '#a0aec0' : '#6A9BB5', fontSize: 13 }}>
        Cargando datos del sistema...
      </div>
    )
  }

  const cards = [
    { title: 'Ventas del día',       value: stats.ventasDia,                                                              icon: <FiShoppingCart size={22} />, color: '#5BBFCC',  detail: 'Hoy' },
    { title: 'Ingresos del día',     value: `Q ${stats.ingresosDia.toFixed(2)}`,                                          icon: <FiTrendingUp   size={22} />, color: '#3DBD8A',  detail: 'Hoy' },
    { title: 'Productos stock bajo', value: stats.bajoStock,                                                              icon: <FiAlertTriangle size={22}/>, color: '#F97316',  detail: null },
    { title: 'Próximos a vencer',    value: stats.porVencer,                                                              icon: <FiCalendar     size={22} />, color: '#EF4444',  detail: null },
  ]

  return (
    <div style={{ padding: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: darkMode ? '#a0aec0' : '#6A9BB5', marginTop: 4 }}>Resumen operativo de Farmacia Villa Norte</p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {cards.map(c => (
          <div key={c.title} style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 14, padding: '20px 18px', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, boxShadow: darkMode ? 'none' : '0 2px 8px rgba(10,25,50,.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: c.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                {c.icon}
              </div>
              {c.detail && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#3DBD8A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <FiArrowUpRight size={11} /> {c.detail}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: darkMode ? '#a0aec0' : '#6A9BB5', fontWeight: 500 }}>{c.title}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: darkMode ? '#ffffff' : '#1A3A5C', marginTop: 4 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>

        {/* Inventario crítico */}
        <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 14, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiPackage size={16} style={{ color: '#5BBFCC' }} /> Estado del Inventario Crítico
            </h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: darkMode ? '#2d3f60' : '#F0F8FA' }}>
                {['Producto', 'Stock actual', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '10px 18px', fontSize: 10, fontWeight: 700, color: darkMode ? '#a0aec0' : '#6A9BB5', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productosBajoStock.length > 0 ? productosBajoStock.map((prod, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#F0F8FA'}` }}>
                  <td style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: darkMode ? '#ffffff' : '#1A3A5C' }}>{prod.producto}</td>
                  <td style={{ padding: '12px 18px', fontSize: 12, color: darkMode ? '#e0e0e0' : '#6A9BB5' }}>{prod.stock_actual} unid.</td>
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: '#FFEDD5', color: '#EA580C', padding: '2px 8px', borderRadius: 20 }}>Stock bajo</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '32px 18px', textAlign: 'center', fontSize: 12, color: darkMode ? '#a0aec0' : '#6A9BB5' }}>
                    Todo el inventario está en niveles óptimos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Alertas */}
        <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 14, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, padding: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', margin: '0 0 16px' }}>Alertas del Sistema</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.bajoStock > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: darkMode ? '#2d1f0a' : '#FFF7ED', border: `1px solid ${darkMode ? '#92400e' : '#FED7AA'}`, borderRadius: 10, padding: '12px 14px' }}>
                <FiAlertTriangle size={16} style={{ color: '#F97316', marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: darkMode ? '#fed7aa' : '#C2410C' }}>Reabastecimiento necesario</div>
                  <div style={{ fontSize: 11, color: darkMode ? '#fdba74' : '#EA580C', marginTop: 2 }}>Tenés {stats.bajoStock} productos con stock crítico.</div>
                </div>
              </div>
            )}
            {stats.porVencer > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: darkMode ? '#2d0a0a' : '#FEF2F2', border: `1px solid ${darkMode ? '#991b1b' : '#FECACA'}`, borderRadius: 10, padding: '12px 14px' }}>
                <FiCalendar size={16} style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: darkMode ? '#fecaca' : '#B91C1C' }}>Vencimiento próximo</div>
                  <div style={{ fontSize: 11, color: darkMode ? '#fca5a5' : '#DC2626', marginTop: 2 }}>{stats.porVencer} productos vencen en menos de 30 días.</div>
                </div>
              </div>
            )}
            {stats.bajoStock === 0 && stats.porVencer === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FiPackage size={22} style={{ color: '#16A34A' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: darkMode ? '#ffffff' : '#1A3A5C' }}>No hay alertas activas</div>
                <div style={{ fontSize: 11, color: darkMode ? '#a0aec0' : '#6A9BB5', marginTop: 4 }}>El sistema está operando normalmente.</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}