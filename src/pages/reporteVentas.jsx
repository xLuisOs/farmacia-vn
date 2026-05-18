import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../packages/supabase'
import * as XLSX from 'xlsx'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  FiCalendar, FiShoppingCart, FiTrendingUp, FiCreditCard,
  FiChevronDown, FiChevronUp, FiRefreshCw, FiPackage,
  FiAlertCircle, FiDownload
} from 'react-icons/fi'

const ZONA = 'America/Guatemala'
const toUTC = (f) => new Date(f.endsWith('Z') ? f : f + 'Z')
const fmtHora = (d) => d.toLocaleTimeString('es-GT', { timeZone: ZONA, hour: '2-digit', minute: '2-digit', hour12: true })

const inicioDia = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 6, 0, 0))
}
const finDia = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + 1, 5, 59, 59))
}

const TH = (darkMode) => ({
  background: darkMode ? '#2d3f60' : '#F0F8FA', fontSize: 9, fontWeight: 700, color: darkMode ? '#a0aec0' : '#6A9BB5',
  textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left'
})
const TD = (darkMode) => ({
  padding: '10px 16px', fontSize: 11, color: darkMode ? '#e0e0e0' : '#2d3f60',
  borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`
})

function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: darkMode ? '#1a2332' : 'white', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ fontSize: 10, color: '#6A9BB5', fontWeight: 700, marginBottom: 4 }}>{label}:00 hrs</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: darkMode ? '#ffffff' : '#1A3A5C' }}>
        Q {parseFloat(payload[0].value).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
      </div>
      <div style={{ fontSize: 10, color: '#6A9BB5' }}>
        {payload[1]?.value || 0} venta{payload[1]?.value !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function FilaVenta({ venta, darkMode }) {
  const [expandida, setExpandida] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [cargando, setCargando] = useState(false)

  const cargarDetalle = async () => {
    if (detalle) { setExpandida(!expandida); return }
    setCargando(true)
    try {
      const { data, error } = await supabase
        .from('detalle_venta')
        .select(`
          id_detalle_venta, cantidad, precio_unitario, subtotal,
          producto:id_producto ( nombre ),
          lote:id_lote ( numero_lote, fecha_vencimiento )
        `)
        .eq('id_venta', venta.id_venta)
      if (error) throw error
      setDetalle(data || [])
      setExpandida(true)
    } catch (err) {
      console.error('Error cargando detalle:', err.message)
    } finally {
      setCargando(false)
    }
  }

  const metodoBg = {
    efectivo:      ['#DCFCE7', '#166534'],
    tarjeta:       ['#EFF6FF', '#1D4ED8'],
    transferencia: ['#F3E8FF', '#7E22CE'],
  }
  const [bg, color] = metodoBg[venta.metodo_pago] || ['#F0F8FA', '#1A3A5C']

  return (
    <>
      <tr
        onClick={cargarDetalle}
        style={{ cursor: 'pointer', background: expandida ? (darkMode ? '#1e3a5f' : '#F0FAFA') : (darkMode ? '#1a2332' : 'white'), transition: 'background .15s' }}
      >
        <td style={{ ...TD(darkMode), fontWeight: 700, color: darkMode ? '#5BBFCC' : '#3A6E9E' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {cargando
              ? <FiRefreshCw size={11} style={{ animation: 'spin 1s linear infinite', color: '#A8CEDD' }} />
              : expandida
                ? <FiChevronUp size={13} style={{ color: '#5BBFCC' }} />
                : <FiChevronDown size={13} style={{ color: '#A8CEDD' }} />
            }
            V-{String(venta.id_venta).padStart(4, '0')}
          </div>
        </td>
        <td style={TD(darkMode)}>{fmtHora(toUTC(venta.fecha))}</td>
        <td style={{ ...TD(darkMode), fontWeight: 500 }}>{venta.usuario?.nombre_completo || '—'}</td>
        <td style={{ ...TD(darkMode), textAlign: 'center' }}>
          <span style={{ background: darkMode ? '#1a3a5c' : '#DFF4F7', color: darkMode ? '#5BBFCC' : '#3A6E9E', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>
            {venta.detalle_venta?.length || 0}
          </span>
        </td>
        <td style={{ ...TD(darkMode), fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>
          Q {parseFloat(venta.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
        </td>
        <td style={TD(darkMode)}>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: bg, color, textTransform: 'capitalize' }}>
            {venta.metodo_pago}
          </span>
        </td>
      </tr>

      {expandida && detalle && (
        <tr>
          <td colSpan={6} style={{ padding: 0, borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }}>
            <div style={{ background: darkMode ? '#162032' : '#F8FCFD', padding: '12px 20px 14px 44px', borderTop: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6A9BB5', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 8 }}>
                Productos de esta venta
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Producto', 'Lote', 'Vence', 'Cantidad', 'Precio unit.', 'Subtotal'].map(h => (
                      <th key={h} style={{ ...TH(darkMode), fontSize: 8, padding: '6px 12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalle.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...TD(darkMode), textAlign: 'center', color: '#A8CEDD', fontSize: 10 }}>Sin detalle disponible</td></tr>
                  ) : detalle.map(d => (
                    <tr key={d.id_detalle_venta}>
                      <td style={{ ...TD(darkMode), fontSize: 11, fontWeight: 600, color: darkMode ? '#ffffff' : '#1A3A5C', padding: '7px 12px' }}>{d.producto?.nombre || '—'}</td>
                      <td style={{ ...TD(darkMode), fontSize: 10, color: '#6A9BB5', padding: '7px 12px' }}>{d.lote?.numero_lote || <span style={{ fontStyle: 'italic', opacity: .6 }}>sin núm.</span>}</td>
                      <td style={{ ...TD(darkMode), fontSize: 10, padding: '7px 12px' }}>
                        {d.lote?.fecha_vencimiento ? new Date(d.lote.fecha_vencimiento + 'T12:00:00Z').toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ ...TD(darkMode), textAlign: 'center', fontSize: 11, padding: '7px 12px', fontWeight: 700, color: darkMode ? '#5BBFCC' : '#3A6E9E' }}>{d.cantidad}</td>
                      <td style={{ ...TD(darkMode), fontSize: 11, padding: '7px 12px' }}>Q {parseFloat(d.precio_unitario).toFixed(2)}</td>
                      <td style={{ ...TD(darkMode), fontSize: 11, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', padding: '7px 12px' }}>Q {parseFloat(d.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function ReporteVentas({ darkMode }) {
  const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: ZONA })
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyStr)
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarVentas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const desde = inicioDia(fechaSeleccionada).toISOString()
      const hasta = finDia(fechaSeleccionada).toISOString()
      const { data, error: err } = await supabase
        .from('venta')
        .select(`id_venta, fecha, total, metodo_pago, estado, usuario:id_usuario ( nombre_completo ), detalle_venta ( id_detalle_venta )`)
        .eq('estado', 'completada')
        .gte('fecha', desde)
        .lte('fecha', hasta)
        .order('fecha', { ascending: true })
      if (err) throw err
      setVentas(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fechaSeleccionada])

  useEffect(() => { cargarVentas() }, [cargarVentas])

  const totalIngresos = ventas.reduce((s, v) => s + parseFloat(v.total || 0), 0)
  const ticketPromedio = ventas.length > 0 ? totalIngresos / ventas.length : 0
  const totalProductos = ventas.reduce((s, v) => s + (v.detalle_venta?.length || 0), 0)
  const conteoMetodo = ventas.reduce((acc, v) => { acc[v.metodo_pago] = (acc[v.metodo_pago] || 0) + 1; return acc }, {})
  const metodoPrincipal = Object.entries(conteoMetodo).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const datosPorHora = Array.from({ length: 14 }, (_, i) => {
    const hora = i + 8
    const ventasHora = ventas.filter(v => {
      const h = toUTC(v.fecha).toLocaleString('es-GT', { timeZone: ZONA, hour: 'numeric', hour12: false })
      return parseInt(h) === hora
    })
    return { hora: `${hora}`, ingresos: ventasHora.reduce((s, v) => s + parseFloat(v.total || 0), 0), cantidad: ventasHora.length }
  })

  const maxIngresos = Math.max(...datosPorHora.map(d => d.ingresos), 1)
  const [y, m, d] = fechaSeleccionada.split('-').map(Number)
  const fechaBonita = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const esHoy = fechaSeleccionada === hoyStr

  const exportarExcel = () => {
  const wb = XLSX.utils.book_new()

  const datosResumen = [
    ['REPORTE DE VENTAS DIARIAS', '', ''],
    ['Fecha:', fechaBonita, ''],
    ['Generado:', new Date().toLocaleDateString('es-GT'), ''],
    ['', '', ''],
    ['ESTADÍSTICAS DEL DÍA', '', ''],
    ['Concepto', 'Valor', ''],
    ['Total de Ventas', ventas.length, ''],
    ['Ingresos Totales (Q)', totalIngresos, ''],
    ['Ticket Promedio (Q)', ticketPromedio, ''],
    ['Total de Productos Vendidos', totalProductos, ''],
    ['Método de Pago Principal', metodoPrincipal.charAt(0).toUpperCase() + metodoPrincipal.slice(1), ''],
    ['', '', ''],
    ['INGRESOS POR HORA', '', ''],
    ['Hora', 'Ingresos (Q)', 'Cantidad de Ventas'],
    ...datosPorHora.map(d => [`${d.hora}:00`, d.ingresos, d.cantidad])
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(datosResumen)
  ws1['!cols'] = [{ wch: 32 }, { wch: 20 }, { wch: 20 }]
  // Formato número para las celdas de Q
  ;['B8', 'B9'].forEach(cell => { if (ws1[cell]) ws1[cell].z = '"Q"#,##0.00' })
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')

  const datosVentas = [
    ['DETALLE DE VENTAS', '', '', '', '', ''],
    ['Fecha:', fechaBonita, '', '', '', ''],
    ['', '', '', '', '', ''],
    ['# Venta', 'Hora', 'Cajero', 'Método de Pago', 'Total (Q)', 'Productos'],
    ...ventas.map(v => [
      `V-${String(v.id_venta).padStart(4, '0')}`,
      fmtHora(toUTC(v.fecha)),
      v.usuario?.nombre_completo || '—',
      v.metodo_pago.charAt(0).toUpperCase() + v.metodo_pago.slice(1),
      parseFloat(v.total),
      v.detalle_venta?.length || 0
    ]),
    ['', '', '', '', '', ''],
    ['TOTAL', '', '', '', totalIngresos, totalProductos]
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(datosVentas)
  ws2['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Ventas')

  XLSX.writeFile(wb, `Ventas_${fechaSeleccionada}.xlsx`)
}

  return (
    <div
  className="p-4"
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: darkMode ? '#1a1f2e' : '#f0f8fa'
  }}
>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Ventas diarias</div>
          <div style={{ fontSize: 13, color: darkMode ? '#a0aec0' : '#6A9BB5', textTransform: 'capitalize', marginTop: 2 }}>
            {fechaBonita} {esHoy && <span style={{ background: '#5BBFCC', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 10, marginLeft: 6 }}>HOY</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: darkMode ? '#1a2332' : 'white', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, borderRadius: 8, padding: '6px 12px' }}>
            <FiCalendar size={13} style={{ color: '#6A9BB5' }} />
            <input
              type="date" value={fechaSeleccionada} max={hoyStr}
              onChange={e => setFechaSeleccionada(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 11, color: darkMode ? '#ffffff' : '#1A3A5C', fontFamily: 'inherit', background: 'transparent', cursor: 'pointer' }}
            />
          </div>
          <button
            onClick={cargarVentas}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, background: darkMode ? '#1a2332' : 'white', color: darkMode ? '#a0aec0' : '#1A3A5C', fontFamily: 'inherit' }}
          >
            <FiRefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
          <button
            onClick={exportarExcel}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, background: darkMode ? '#1a2332' : 'white', color: darkMode ? '#a0aec0' : '#1A3A5C', fontFamily: 'inherit' }}
            title="Exportar a Excel"
          >
            <FiDownload size={13} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiAlertCircle size={14} /> {error}
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Ventas del día',   value: ventas.length,                                                                    icon: <FiShoppingCart size={18} />, color: '#5BBFCC' },
          { label: 'Ingresos totales', value: `Q ${totalIngresos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,      icon: <FiTrendingUp   size={18} />, color: '#3DBD8A' },
          { label: 'Ticket promedio',  value: `Q ${ticketPromedio.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,     icon: <FiPackage      size={18} />, color: '#3A6E9E' },
          { label: 'Método principal', value: metodoPrincipal.charAt(0).toUpperCase() + metodoPrincipal.slice(1),              icon: <FiCreditCard   size={18} />, color: '#7C5CBF' },
        ].map(s => (
          <div key={s.label} style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, padding: '14px 16px', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: darkMode ? '#ffffff' : '#1A3A5C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {loading ? '—' : s.value}
              </div>
              <div style={{ fontSize: 10, color: darkMode ? '#a0aec0' : '#6A9BB5' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Ingresos por hora</div>
            <div style={{ fontSize: 10, color: darkMode ? '#a0aec0' : '#6A9BB5', marginTop: 1 }}>De 8:00 a 21:00 hrs</div>
          </div>
          {totalProductos > 0 && (
            <span style={{ fontSize: 10, color: darkMode ? '#a0aec0' : '#6A9BB5' }}>
              {totalProductos} producto{totalProductos !== 1 ? 's' : ''} vendido{totalProductos !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {loading ? (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8CEDD', fontSize: 11 }}>Cargando gráfico...</div>
        ) : ventas.length === 0 ? (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#A8CEDD', gap: 6 }}>
            <FiTrendingUp size={28} style={{ opacity: .3 }} />
            <div style={{ fontSize: 11 }}>Sin ventas para esta fecha</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={datosPorHora} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="hora" tick={{ fontSize: 9, fill: darkMode ? '#a0aec0' : '#6A9BB5', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={h => `${h}h`} />
              <YAxis tick={{ fontSize: 9, fill: darkMode ? '#a0aec0' : '#A8CEDD', fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '' : `Q${v}`} />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{ fill: darkMode ? '#1e3a5f' : '#F0F8FA' }} />
              <Bar dataKey="ingresos" radius={[5, 5, 0, 0]} name="Ingresos">
                {datosPorHora.map((entry, i) => (
                  <Cell key={i} fill={entry.ingresos === maxIngresos && entry.ingresos > 0 ? '#5BBFCC' : entry.ingresos > 0 ? '#A8CEDD' : (darkMode ? '#2d3f60' : '#E2F0F4')} />
                ))}
              </Bar>
              <Bar dataKey="cantidad" hide name="Ventas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Detalle de ventas</div>
            <div style={{ fontSize: 10, color: darkMode ? '#a0aec0' : '#6A9BB5', marginTop: 1 }}>Click en cualquier fila para ver los productos vendidos</div>
          </div>
          {ventas.length > 0 && (
            <span style={{ background: '#1A3A5C', color: 'white', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
              {ventas.length} venta{ventas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD', fontSize: 11 }}>Cargando ventas...</div>
        ) : ventas.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD' }}>
            <FiShoppingCart size={28} style={{ marginBottom: 8, opacity: .3, display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12 }}>No hay ventas registradas para esta fecha</div>
            <div style={{ fontSize: 10, marginTop: 4, color: '#C5D9E3' }}>Probá seleccionando otra fecha en el selector de arriba</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['# Venta', 'Hora', 'Cajero', 'Productos', 'Total', 'Método'].map(h => <th key={h} style={TH(darkMode)}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {ventas.map(v => <FilaVenta key={v.id_venta} venta={v} darkMode={darkMode} />)}
            </tbody>
            <tfoot>
              <tr style={{ background: darkMode ? '#2d3f60' : '#F0F8FA' }}>
                <td colSpan={3} style={{ ...TD(darkMode), fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', fontSize: 11 }}>TOTAL DEL DÍA</td>
                <td style={{ ...TD(darkMode), textAlign: 'center', fontWeight: 700, color: darkMode ? '#5BBFCC' : '#3A6E9E', fontSize: 11 }}>{totalProductos}</td>
                <td style={{ ...TD(darkMode), fontWeight: 800, color: darkMode ? '#ffffff' : '#1A3A5C', fontSize: 13 }}>Q {totalIngresos.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                <td style={TD(darkMode)} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}