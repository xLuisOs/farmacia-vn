import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../packages/supabase'
import { FiRefreshCw, FiSearch, FiFileText } from 'react-icons/fi'

// ─── Estilos base ─────────────────────────────────────────────────────────────
const TH = (darkMode) => ({
  background: darkMode ? '#2d3f60' : '#F0F8FA', fontSize: 11, fontWeight: 700, color: darkMode ? '#a0aec0' : '#6A9BB5',
  textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left'
})
const TD = (darkMode) => ({
  padding: '16px 16px', fontSize: 13, color: darkMode ? '#e0e0e0' : '#2d3f60',
  borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`
})
const BTN_SECONDARY = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
  borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  border: '1.5px solid #E2F0F4', background: 'white', color: '#1A3A5C', fontFamily: 'inherit',
  transition: 'all .2s'
}
const INPUT = {
  padding: '8px 10px', borderRadius: 7, border: '1.5px solid #E2F0F4',
  fontSize: 11, color: '#1A3A5C', background: 'white',
  width: '100%', fontFamily: 'inherit', outline: 'none'
}

// ─── Helpers de fecha (zona horaria Guatemala) ────────────────────────────────
const ZONA = 'America/Guatemala'
const toUTC = (f) => new Date(f.endsWith('Z') ? f : f + 'Z')
const optsDate = { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }
const fechaLocalHoy = () => new Date().toLocaleDateString('es-GT', optsDate)
const fechaLocalDe = (f) => toUTC(f).toLocaleDateString('es-GT', optsDate)

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Facturacion({ user, darkMode }) {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const { data: facturasData, error: errF } = await supabase
        .from('factura')
        .select(`
          id_factura, numero_factura, fecha_emision, nit, nombre_cliente, total,
          venta:id_venta (
            id_venta, fecha, metodo_pago, estado,
            usuario:id_usuario ( nombre_completo )
          )
        `)
        .order('id_factura', { ascending: false })
        .limit(100)
      if (errF) throw new Error(errF.message)
      setFacturas(facturasData || [])
    } catch (err) {
      console.error('Error cargando facturación:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // Stats del día
  const hoy = fechaLocalHoy()
  const facturasHoy = facturas.filter(f => fechaLocalDe(f.fecha_emision) === hoy)
  const totalHoy = facturasHoy.reduce((s, f) => s + parseFloat(f.total || 0), 0)
  const facturasCF = facturasHoy.filter(f => f.nit?.toUpperCase() === 'CF').length

  // Filtro historial
  const facturasFiltradas = facturas.filter(f =>
    f.numero_factura?.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.nit?.toLowerCase().includes(busqueda.toLowerCase()) ||
    `V-${String(f.venta?.id_venta || '').padStart(4, '0')}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Facturación</div>
          <div style={{ fontSize: 14, color: darkMode ? '#a0aec0' : '#6A9BB5'  }}>Registro de facturas emitidas</div>
        </div>
        <button onClick={cargarDatos} style={{ ...BTN_SECONDARY, padding: '8px 12px' }}>
          <FiRefreshCw size={13} />
        </button>
      </div>

      {/* Stats del día */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Facturas emitidas hoy', value: facturasHoy.length,                                                     icon: '🧾' },
          { label: 'Total facturado hoy',   value: `Q ${totalHoy.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, icon: '💵' },
          { label: 'Facturas CF (hoy)',      value: facturasCF,                                                             icon: '👤' },
        ].map(s => (
          <div key={s.label} style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, padding: 14, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: darkMode ? '#2d3f60' : '#F0F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: darkMode ? '#ffffff' : '#1A3A5C' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: darkMode ? '#a0aec0' : '#6A9BB5' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Historial */}
      <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>🧾 Historial de facturas</div>
            <div style={{ fontSize: 10, color: darkMode ? '#a0aec0' : '#6A9BB5', marginTop: 1 }}>
              {facturas.length} factura{facturas.length !== 1 ? 's' : ''} registrada{facturas.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <FiSearch size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: darkMode ? '#6A9BB5' : '#A8CEDD' }} />
            <input
              type="text"
              placeholder="Buscar por # factura, NIT, cliente…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ ...INPUT, width: 230, paddingLeft: 28, fontSize: 10, background: darkMode ? '#2d3f60' : '#ffffff', color: darkMode ? '#ffffff' : '#1A3A5C', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: darkMode ? '#6A9BB5' : '#A8CEDD', fontSize: 11 }}>
            Cargando facturas…
          </div>
        ) : facturasFiltradas.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: darkMode ? '#6A9BB5' : '#A8CEDD' }}>
            <FiFileText size={28} style={{ marginBottom: 8, opacity: .4, display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12 }}>
              {busqueda ? 'Sin resultados para esa búsqueda' : 'No hay facturas emitidas aún'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['# Factura', 'Venta', 'Fecha emisión', 'Hora', 'NIT', 'Cliente', 'Cajero', 'Total'].map(h => (
                  <th key={h} style={TH(darkMode)}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.map(f => {
                const fechaEmision = toUTC(f.fecha_emision)
                const optsZona = { timeZone: ZONA }
                return (
                  <tr key={f.id_factura}
                    onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#2d3f60' : '#FAFEFF'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...TD(darkMode), fontWeight: 700, color: darkMode ? '#5BBFCC' : '#3A6E9E' }}>{f.numero_factura}</td>
                    <td style={TD(darkMode)}>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: darkMode ? '#1a3a5c' : '#DFF4F7', color: darkMode ? '#5BBFCC' : '#3A6E9E' }}>
                        V-{String(f.venta?.id_venta || '').padStart(4, '0')}
                      </span>
                    </td>
                    <td style={TD(darkMode)}>
                      {fechaEmision.toLocaleDateString('es-GT', { ...optsZona, day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td style={TD(darkMode)}>
                      {fechaEmision.toLocaleTimeString('es-GT', { ...optsZona, hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                    <td style={TD(darkMode)}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                        background: f.nit?.toUpperCase() === 'CF' ? (darkMode ? '#2d3f60' : '#F0F8FA') : (darkMode ? '#1a3a5c' : '#EFF6FF'),
                        color: f.nit?.toUpperCase() === 'CF' ? (darkMode ? '#a0aec0' : '#6A9BB5') : (darkMode ? '#5BBFCC' : '#1D4ED8')
                      }}>
                        {f.nit}
                      </span>
                    </td>
                    <td style={{ ...TD(darkMode), fontWeight: 500 }}>{f.nombre_cliente || '—'}</td>
                    <td style={TD(darkMode)}>{f.venta?.usuario?.nombre_completo || '—'}</td>
                    <td style={{ ...TD(darkMode), fontWeight: 700, color: darkMode ? '#5BBFCC' : '#1A3A5C' }}>
                      Q {parseFloat(f.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}