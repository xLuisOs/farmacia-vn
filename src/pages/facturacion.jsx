import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../packages/supabase'
import {
  FiPlus, FiRefreshCw, FiSearch, FiFileText, FiAlertCircle, FiCheck
} from 'react-icons/fi'

// ─── Estilos base ─────────────────────────────────────────────────────────────
const TH = {
  background: '#F0F8FA', fontSize: 9, fontWeight: 700, color: '#6A9BB5',
  textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left'
}
const TD = {
  padding: '10px 16px', fontSize: 11, color: '#2d3f60',
  borderBottom: '1px solid #E2F0F4'
}
const BTN_PRIMARY = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
  borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
  border: 'none', background: '#06B6D4', color: 'white', fontFamily: 'inherit',
  boxShadow: '0 10px 15px rgba(6,182,212,.2)', transition: 'all .2s'
}
const BTN_PRIMARY_HOVER = {
  ...BTN_PRIMARY,
  background: '#0891B2'
}
const BTN_SECONDARY = {
  ...BTN_PRIMARY,
  background: 'white', color: '#1A3A5C', border: '1.5px solid #E2F0F4'
}
const INPUT = {
  padding: '8px 10px', borderRadius: 7, border: '1.5px solid #E2F0F4',
  fontSize: 11, color: '#1A3A5C', background: 'white',
  width: '100%', fontFamily: 'inherit', outline: 'none'
}
const LABEL = {
  fontSize: 10, fontWeight: 700, color: '#6A9BB5',
  display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5
}

// ─── Helpers de fecha (zona horaria Guatemala) ────────────────────────────────
const ZONA = 'America/Guatemala'
const toUTC = (f) => new Date(f.endsWith('Z') ? f : f + 'Z')
const optsDate = { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }
const fechaLocalHoy = () => new Date().toLocaleDateString('es-GT', optsDate)
const fechaLocalDe = (f) => toUTC(f).toLocaleDateString('es-GT', optsDate)

// ─── Modal emitir factura ─────────────────────────────────────────────────────
function ModalEmitirFactura({ ventasSinFactura, onClose, onGuardado }) {
  const [idVenta, setIdVenta] = useState('')
  const [nit, setNit] = useState('CF')
  const [cliente, setCliente] = useState('Consumidor Final')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  const ventaSeleccionada = ventasSinFactura.find(v => String(v.id_venta) === String(idVenta))

  const handleNitChange = (val) => {
    setNit(val)
    if (val.trim().toUpperCase() === 'CF') {
      setCliente('Consumidor Final')
    }
  }

  const emitir = async () => {
    if (!ventaSeleccionada) return
    setGuardando(true)
    setError(null)

    try {
      // 1. Generar número correlativo consultando el último
      const { data: ultima } = await supabase
        .from('factura')
        .select('numero_factura')
        .order('id_factura', { ascending: false })
        .limit(1)
        .maybeSingle()

      let siguiente = 1
      if (ultima?.numero_factura) {
        const num = parseInt(ultima.numero_factura.replace(/\D/g, ''), 10)
        if (!isNaN(num)) siguiente = num + 1
      }

      const numeroFactura = `F-${String(siguiente).padStart(4, '0')}`

      // 2. Insertar la factura
      const { error: errInsert } = await supabase
        .from('factura')
        .insert({
          numero_factura: numeroFactura,
          id_venta: ventaSeleccionada.id_venta,
          nit: nit.trim() || 'CF',
          nombre_cliente: cliente.trim() || 'Consumidor Final',
          total: ventaSeleccionada.total,
        })

      if (errInsert) throw new Error(errInsert.message)

      setExito(true)
      setTimeout(() => {
        onGuardado()
        onClose()
      }, 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 500, boxShadow: '0 20px 60px rgba(0,0,0,.3)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(90deg,#1A3A5C,#2A5278)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiFileText size={16} color="white" />
            <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>Emitir Factura</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Selector de venta */}
          <div>
            <label style={LABEL}>Venta completada (sin factura)</label>
            <select value={idVenta} onChange={e => setIdVenta(e.target.value)} style={INPUT}>
              <option value="">Seleccionar venta…</option>
              {ventasSinFactura.map(v => (
                <option key={v.id_venta} value={v.id_venta}>
                  V-{String(v.id_venta).padStart(4, '0')} — {fechaLocalDe(v.fecha)} — Q {parseFloat(v.total).toFixed(2)}
                </option>
              ))}
            </select>
            {ventasSinFactura.length === 0 && (
              <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 4 }}>
                ⚠️ Todas las ventas completadas ya tienen factura.
              </div>
            )}
          </div>

          {/* NIT */}
          <div>
            <label style={LABEL}>NIT del cliente</label>
            <input
              value={nit}
              onChange={e => handleNitChange(e.target.value)}
              placeholder="Ej: 1234567-8 o CF"
              style={INPUT}
            />
          </div>

          {/* Nombre cliente */}
          <div>
            <label style={LABEL}>Nombre del cliente</label>
            <input
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Nombre completo o razón social"
              style={INPUT}
            />
          </div>

          {/* Resumen de la venta seleccionada */}
          {ventaSeleccionada && (
            <div style={{ background: '#F0F8FA', borderRadius: 10, padding: 14, border: '1px solid #E2F0F4' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6A9BB5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>Resumen de la venta</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 11, color: '#3d5280', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div>Venta: <strong>V-{String(ventaSeleccionada.id_venta).padStart(4, '0')}</strong></div>
                  <div>Cajero: {ventaSeleccionada.usuario?.nombre_completo || '—'}</div>
                  <div>Método: <span style={{ textTransform: 'capitalize' }}>{ventaSeleccionada.metodo_pago}</span></div>
                  <div>Productos: {ventaSeleccionada.detalle_venta?.length || 0} línea(s)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#6A9BB5' }}>Total a facturar</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#1A3A5C' }}>
                    Q {parseFloat(ventaSeleccionada.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAlertCircle size={14} color="#991B1B" />
              <span style={{ fontSize: 11, color: '#991B1B' }}>{error}</span>
            </div>
          )}

          {/* Éxito */}
          {exito && (
            <div style={{ background: '#DCFCE7', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCheck size={14} color="#166534" />
              <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>¡Factura emitida correctamente!</span>
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #E2F0F4' }}>
            <button onClick={onClose} style={{ ...BTN_SECONDARY, fontFamily: 'inherit' }} disabled={guardando}>
              Cancelar
            </button>
            <button
              onClick={emitir}
              disabled={!idVenta || guardando || exito}
              style={{
                ...BTN_PRIMARY,
                fontFamily: 'inherit',
                background: (!idVenta || guardando || exito) ? '#E0F7FA' : '#06B6D4',
                color: (!idVenta || guardando || exito) ? '#80DEEA' : 'white',
                cursor: (!idVenta || guardando || exito) ? 'not-allowed' : 'pointer',
              }}
            >
              {guardando
                ? <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #80DEEA', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Emitiendo…</>
                : <><FiFileText size={13} /> Emitir factura</>
              }
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Facturacion({ user, darkMode }) {
  const [facturas, setFacturas] = useState([])
  const [ventasSinFactura, setVentasSinFactura] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      // Facturas con join a venta y usuario
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

      // IDs de ventas que ya tienen factura
      const idsFact = (facturasData || []).map(f => f.venta?.id_venta).filter(Boolean)

      // Ventas completadas sin factura
      let query = supabase
        .from('venta')
        .select(`
          id_venta, fecha, total, metodo_pago,
          usuario:id_usuario ( nombre_completo ),
          detalle_venta ( id_detalle_venta )
        `)
        .eq('estado', 'completada')
        .order('fecha', { ascending: false })
        .limit(200)

      if (idsFact.length > 0) {
        query = query.not('id_venta', 'in', `(${idsFact.join(',')})`)
      }

      const { data: ventasData, error: errV } = await query
      if (errV) throw new Error(errV.message)

      setFacturas(facturasData || [])
      setVentasSinFactura(ventasData || [])
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
    <>
      {modalAbierto && (
        <ModalEmitirFactura
          ventasSinFactura={ventasSinFactura}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarDatos}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Facturación</div>
          <div style={{ fontSize: 11, color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Emisión y registro de facturas</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={cargarDatos} style={{ ...BTN_SECONDARY, fontFamily: 'inherit', padding: '8px 12px' }}>
            <FiRefreshCw size={13} />
          </button>
          <button onClick={() => setModalAbierto(true)} style={{ ...BTN_PRIMARY, fontFamily: 'inherit' }}>
            <FiPlus size={16} /> Emitir factura
          </button>
        </div>
      </div>

      {/* Stats del día */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Facturas emitidas hoy', value: facturasHoy.length,                                                                icon: '🧾' },
          { label: 'Total facturado hoy',   value: `Q ${totalHoy.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,            icon: '💵' },
          { label: 'Facturas CF (hoy)',      value: facturasCF,                                                                       icon: '👤' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 14, border: '1.5px solid #E2F0F4', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A3A5C' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6A9BB5' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerta ventas sin facturar */}
      {ventasSinFactura.length > 0 && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiAlertCircle size={14} color="#D97706" />
          <span style={{ fontSize: 11, color: '#92400E' }}>
            Hay <strong>{ventasSinFactura.length}</strong> venta{ventasSinFactura.length !== 1 ? 's' : ''} completada{ventasSinFactura.length !== 1 ? 's' : ''} sin factura.
          </span>
          <button
            onClick={() => setModalAbierto(true)}
            style={{ marginLeft: 'auto', ...BTN_PRIMARY, fontFamily: 'inherit', padding: '5px 12px', fontSize: 10 }}
          >
            Emitir ahora
          </button>
        </div>
      )}

      {/* Historial */}
      <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #E2F0F4', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2F0F4' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>🧾 Historial de facturas</div>
            <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 1 }}>
              {facturas.length} factura{facturas.length !== 1 ? 's' : ''} registrada{facturas.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <FiSearch size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#A8CEDD' }} />
            <input
              type="text"
              placeholder="Buscar por # factura, NIT, cliente…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ ...INPUT, width: 230, paddingLeft: 28, fontSize: 10 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD', fontSize: 11 }}>
            Cargando facturas…
          </div>
        ) : facturasFiltradas.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD' }}>
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
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.map(f => {
                const fechaEmision = toUTC(f.fecha_emision)
                const optsZona = { timeZone: ZONA }
                return (
                  <tr key={f.id_factura}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFEFF'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>{f.numero_factura}</td>
                    <td style={TD}>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#DFF4F7', color: '#3A6E9E' }}>
                        V-{String(f.venta?.id_venta || '').padStart(4, '0')}
                      </span>
                    </td>
                    <td style={TD}>
                      {fechaEmision.toLocaleDateString('es-GT', { ...optsZona, day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td style={TD}>
                      {fechaEmision.toLocaleTimeString('es-GT', { ...optsZona, hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                    <td style={TD}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                        background: f.nit?.toUpperCase() === 'CF' ? '#F0F8FA' : '#EFF6FF',
                        color: f.nit?.toUpperCase() === 'CF' ? '#6A9BB5' : '#1D4ED8'
                      }}>
                        {f.nit}
                      </span>
                    </td>
                    <td style={{ ...TD, fontWeight: 500 }}>{f.nombre_cliente || '—'}</td>
                    <td style={TD}>{f.venta?.usuario?.nombre_completo || '—'}</td>
                    <td style={{ ...TD, fontWeight: 700, color: '#1A3A5C' }}>
                      Q {parseFloat(f.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}