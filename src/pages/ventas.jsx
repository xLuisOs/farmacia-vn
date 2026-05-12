import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../packages/supabase'
import {
  FiPlus, FiX, FiTrash2, FiShoppingCart, FiRefreshCw,
  FiAlertCircle, FiSearch, FiCheck
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
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
  border: 'none', background: '#1A3A5C', color: 'white', fontFamily: 'inherit'
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

// ─── Pills de estado / método ─────────────────────────────────────────────────
function MetodoPill({ metodo }) {
  const map = {
    efectivo:      ['#DCFCE7', '#166534'],
    tarjeta:       ['#EFF6FF', '#1D4ED8'],
    transferencia: ['#F3E8FF', '#7E22CE'],
  }
  const [bg, color] = map[metodo] || ['#F0F8FA', '#1A3A5C']
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: bg, color, textTransform: 'capitalize' }}>
      {metodo}
    </span>
  )
}

function EstadoPill({ estado }) {
  const ok = estado === 'completada'
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: ok ? '#DCFCE7' : '#FEE2E2', color: ok ? '#166534' : '#991B1B', textTransform: 'capitalize' }}>
      {estado}
    </span>
  )
}

// ─── Modal nueva venta ────────────────────────────────────────────────────────
function ModalNuevaVenta({ productos, usuario, onClose, onGuardado }) {
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])   // [{ ...producto, cantidad }]
  const [metodo, setMetodo] = useState('efectivo')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  // Productos filtrados por búsqueda y con stock disponible
  const productosFiltrados = productos.filter(p =>
    p.stock_actual > 0 &&
    p.producto.toLowerCase().includes(busqueda.toLowerCase())
  )

  const agregarAlCarrito = (prod) => {
    const existe = carrito.find(c => c.id_producto === prod.id_producto)
    if (existe) {
      // Si ya está, incrementar cantidad (hasta el stock disponible)
      if (existe.cantidad < prod.stock_actual) {
        setCarrito(prev => prev.map(c =>
          c.id_producto === prod.id_producto
            ? { ...c, cantidad: c.cantidad + 1 }
            : c
        ))
      }
    } else {
      setCarrito(prev => [...prev, { ...prod, cantidad: 1 }])
    }
    setBusqueda('')
  }

  const actualizarCantidad = (id_producto, valor) => {
    const num = parseInt(valor) || 1
    const prod = productos.find(p => p.id_producto === id_producto)
    const max = prod?.stock_actual || 1
    setCarrito(prev => prev.map(c =>
      c.id_producto === id_producto
        ? { ...c, cantidad: Math.min(Math.max(1, num), max) }
        : c
    ))
  }

  const quitarDelCarrito = (id_producto) => {
    setCarrito(prev => prev.filter(c => c.id_producto !== id_producto))
  }

  const total = carrito.reduce((sum, c) => sum + (parseFloat(c.precio_venta) * c.cantidad), 0)
  const puedeGuardar = carrito.length > 0 && !guardando

  const confirmarVenta = async () => {
    if (!puedeGuardar) return
    setGuardando(true)
    setError(null)

    try {
      // 1. Insertar venta principal
      const { data: ventaData, error: errVenta } = await supabase
        .from('venta')
        .insert([{
          total,
          metodo_pago: metodo,
          id_usuario: usuario.id_usuario,
          estado: 'completada'
        }])
        .select('id_venta')
        .single()

      if (errVenta) throw errVenta
      const id_venta = ventaData.id_venta

      // 2. Por cada producto: obtener lote FIFO y registrar detalle_venta
      for (const item of carrito) {
        // Llamar a la función FIFO de la BD para obtener el id_lote
        const { data: loteData, error: errFifo } = await supabase
          .rpc('siguiente_lote_fifo', { p_id_producto: item.id_producto })

        if (errFifo) throw errFifo
        if (!loteData) throw new Error(`Sin stock disponible en lotes para: ${item.producto}`)

        const id_lote = loteData

        // Insertar detalle_venta — el trigger trg_descontar_lote descuenta el lote automáticamente
        const { error: errDetalle } = await supabase
          .from('detalle_venta')
          .insert([{
            id_venta,
            id_producto: item.id_producto,
            id_lote,
            cantidad: item.cantidad,
            precio_unitario: parseFloat(item.precio_venta),
            subtotal: parseFloat(item.precio_venta) * item.cantidad
          }])

        if (errDetalle) throw errDetalle
      }

      onGuardado()
      onClose()
    } catch (err) {
      console.error('Error al registrar venta:', err)
      setError(err.message || 'Error al registrar la venta.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,25,50,.55)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 760,
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(10,25,50,.25)'
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg,#1A3A5C,#2A5278)',
          padding: '18px 22px', borderRadius: '18px 18px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>🛒 Nueva Venta</div>
            <div style={{ color: '#7FD4DE', fontSize: 10, marginTop: 2 }}>
              El stock se descuenta automáticamente al confirmar
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX />
          </button>
        </div>

        {/* Cuerpo — dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden' }}>

          {/* Columna izquierda: buscador + lista de productos */}
          <div style={{ padding: '18px 20px', borderRight: '1px solid #E2F0F4', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={LABEL}>Buscar producto</label>
              <div style={{ position: 'relative' }}>
                <FiSearch size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A8CEDD' }} />
                <input
                  type="text"
                  placeholder="Nombre del medicamento..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  style={{ ...INPUT, paddingLeft: 30 }}
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de productos disponibles */}
            <div style={{ flex: 1 }}>
              {productosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#A8CEDD', padding: '30px 0', fontSize: 11 }}>
                  {busqueda ? 'Sin resultados para esa búsqueda' : 'No hay productos con stock disponible'}
                </div>
              ) : (
                productosFiltrados.map(p => {
                  const enCarrito = carrito.find(c => c.id_producto === p.id_producto)
                  const agotado = enCarrito && enCarrito.cantidad >= p.stock_actual
                  return (
                    <div
                      key={p.id_producto}
                      onClick={() => !agotado && agregarAlCarrito(p)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                        border: `1.5px solid ${enCarrito ? '#5BBFCC' : '#E2F0F4'}`,
                        background: enCarrito ? '#F0FAFA' : 'white',
                        cursor: agotado ? 'not-allowed' : 'pointer',
                        opacity: agotado ? .6 : 1,
                        transition: 'all .15s'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1A3A5C' }}>{p.producto}</div>
                        <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 2 }}>
                          {p.categoria} · Stock: {p.stock_actual} unid.
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#3A6E9E' }}>
                          Q {parseFloat(p.precio_venta).toFixed(2)}
                        </div>
                        {enCarrito && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#5BBFCC' }}>
                            ✓ En carrito ({enCarrito.cantidad})
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Columna derecha: carrito + método + total */}
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1A3A5C' }}>
              🛒 Carrito ({carrito.length} producto{carrito.length !== 1 ? 's' : ''})
            </div>

            {/* Items del carrito */}
            {carrito.length === 0 ? (
              <div style={{ border: '2px dashed #E2F0F4', borderRadius: 10, padding: '24px 16px', textAlign: 'center', color: '#A8CEDD', fontSize: 11, flex: 1 }}>
                <FiShoppingCart size={22} style={{ marginBottom: 8, opacity: .4, display: 'block', margin: '0 auto 8px' }} />
                Seleccioná productos de la izquierda
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {carrito.map(item => (
                  <div key={item.id_producto} style={{ background: '#F8FCFD', border: '1.5px solid #E2F0F4', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1A3A5C', flex: 1, marginRight: 8 }}>
                        {item.producto}
                      </div>
                      <button
                        onClick={() => quitarDelCarrito(item.id_producto)}
                        style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', borderRadius: 5, padding: '2px 6px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', flexShrink: 0 }}
                      >
                        <FiTrash2 size={11} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          style={{ width: 22, height: 22, borderRadius: 5, border: '1.5px solid #E2F0F4', background: 'white', cursor: item.cantidad <= 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3A5C' }}
                        >−</button>
                        <input
                          type="number" min="1" max={item.stock_actual}
                          value={item.cantidad}
                          onChange={e => actualizarCantidad(item.id_producto, e.target.value)}
                          style={{ width: 40, textAlign: 'center', padding: '3px 4px', borderRadius: 5, border: '1.5px solid #E2F0F4', fontSize: 11, fontFamily: 'inherit', color: '#1A3A5C', outline: 'none' }}
                        />
                        <button
                          onClick={() => actualizarCantidad(item.id_producto, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock_actual}
                          style={{ width: 22, height: 22, borderRadius: 5, border: '1.5px solid #E2F0F4', background: 'white', cursor: item.cantidad >= item.stock_actual ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3A5C' }}
                        >+</button>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#3A6E9E' }}>
                        Q {(parseFloat(item.precio_venta) * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: '#A8CEDD', marginTop: 4 }}>
                      Q {parseFloat(item.precio_venta).toFixed(2)} c/u · máx. {item.stock_actual}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Método de pago */}
            <div>
              <label style={LABEL}>Método de pago</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['efectivo', 'tarjeta', 'transferencia'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMetodo(m)}
                    style={{
                      flex: 1, padding: '7px 4px', borderRadius: 7,
                      border: `1.5px solid ${metodo === m ? '#1A3A5C' : '#E2F0F4'}`,
                      background: metodo === m ? '#1A3A5C' : 'white',
                      color: metodo === m ? 'white' : '#6A9BB5',
                      fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'inherit', textTransform: 'capitalize'
                    }}
                  >
                    {m === 'efectivo' ? '💵' : m === 'tarjeta' ? '💳' : '🏦'} {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#991B1B', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <FiAlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
              </div>
            )}

            {/* Total y botón confirmar */}
            <div style={{ borderTop: '2px dashed #E2F0F4', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: '#6A9BB5', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#1A3A5C' }}>
                  Q {total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose} style={{ ...BTN_SECONDARY, fontFamily: 'inherit', flex: 1, justifyContent: 'center' }}>
                  Cancelar
                </button>
                <button
                  onClick={confirmarVenta}
                  disabled={!puedeGuardar}
                  style={{
                    ...BTN_PRIMARY, fontFamily: 'inherit', flex: 2, justifyContent: 'center',
                    background: puedeGuardar ? '#3DBD8A' : '#E2F0F4',
                    color: puedeGuardar ? 'white' : '#A8CEDD',
                    fontSize: 12
                  }}
                >
                  {guardando
                    ? <><FiRefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Registrando...</>
                    : <><FiCheck size={14} /> Confirmar venta</>
                  }
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Ventas({ user }) {
  const [ventas, setVentas] = useState([])
  const [productos, setProductos] = useState([])   // desde vista_stock_actual
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [busquedaHistorial, setBusquedaHistorial] = useState('')

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: ventasData }, { data: productosData }] = await Promise.all([
        supabase
          .from('venta')
          .select(`
            id_venta, fecha, total, metodo_pago, estado,
            usuario:id_usuario ( nombre_completo ),
            detalle_venta ( id_detalle_venta )
          `)
          .order('fecha', { ascending: false })
          .limit(50),
        supabase
          .from('vista_stock_actual')
          .select('*')
          .order('producto', { ascending: true })
      ])

      setVentas(ventasData || [])
      setProductos(productosData || [])
    } catch (err) {
      console.error('Error cargando ventas:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Stats del día — zona horaria Guatemala (UTC-6)
  // Supabase devuelve timestamps SIN "Z", hay que forzar UTC antes de convertir
  const ZONA = 'America/Guatemala'
  const toUTC = (f) => new Date(f.endsWith('Z') ? f : f + 'Z')
  const optsDate = { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }
  const fechaLocalHoy = new Date().toLocaleDateString('es-GT', optsDate)
  const fechaLocalDeVenta = (f) => toUTC(f).toLocaleDateString('es-GT', optsDate)
  const ventasHoy = ventas.filter(v => fechaLocalDeVenta(v.fecha) === fechaLocalHoy && v.estado === 'completada')
  const ingresosHoy = ventasHoy.reduce((s, v) => s + parseFloat(v.total || 0), 0)
  const ticketPromedio = ventasHoy.length > 0 ? ingresosHoy / ventasHoy.length : 0

  // Filtro historial
  const ventasFiltradas = ventas.filter(v =>
    `C-${String(v.id_venta).padStart(4, '0')}`.toLowerCase().includes(busquedaHistorial.toLowerCase()) ||
    (v.usuario?.nombre_completo || '').toLowerCase().includes(busquedaHistorial.toLowerCase())
  )

  return (
    <>
      {modalAbierto && (
        <ModalNuevaVenta
          productos={productos}
          usuario={user}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarDatos}
        />
      )}

      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>Ventas</div>
          <div style={{ fontSize: 11, color: '#6A9BB5' }}>Registro de ventas · descuento FIFO automático</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={cargarDatos}
            style={{ ...BTN_SECONDARY, fontFamily: 'inherit', padding: '8px 12px' }}
          >
            <FiRefreshCw size={13} />
          </button>
          <button
            onClick={() => setModalAbierto(true)}
            style={{ ...BTN_PRIMARY, fontFamily: 'inherit', padding: '8px 18px' }}
          >
            <FiPlus size={14} /> Nueva venta
          </button>
        </div>
      </div>

      {/* ─── Stats del día ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Ventas hoy',      value: ventasHoy.length,                                                                    icon: '🛒' },
          { label: 'Ingresos hoy',    value: `Q ${ingresosHoy.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,            icon: '💵' },
          { label: 'Ticket promedio', value: `Q ${ticketPromedio.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,         icon: '📊' },
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

      {/* ─── Historial ────────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #E2F0F4', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2F0F4' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>📋 Historial de ventas</div>
            <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 1 }}>Últimas 50 ventas</div>
          </div>
          <div style={{ position: 'relative' }}>
            <FiSearch size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#A8CEDD' }} />
            <input
              type="text"
              placeholder="Buscar por # o cajero..."
              value={busquedaHistorial}
              onChange={e => setBusquedaHistorial(e.target.value)}
              style={{ ...INPUT, width: 200, paddingLeft: 28, fontSize: 10 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD', fontSize: 11 }}>
            Cargando ventas...
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD' }}>
            <FiShoppingCart size={28} style={{ marginBottom: 8, opacity: .4, display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 12 }}>
              {busquedaHistorial ? 'Sin resultados para esa búsqueda' : 'No hay ventas registradas aún'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['# Venta', 'Fecha', 'Hora', 'Cajero', 'Productos', 'Total', 'Método', 'Estado'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map(v => {
                // toUTC fuerza que Supabase timestamp (sin Z) se parsee como UTC
                const fecha = toUTC(v.fecha)
                const optsZona = { timeZone: ZONA }
                return (
                  <tr key={v.id_venta}>
                    <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>
                      V-{String(v.id_venta).padStart(4, '0')}
                    </td>
                    <td style={TD}>
                      {fecha.toLocaleDateString('es-GT', { ...optsZona, day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td style={TD}>
                      {fecha.toLocaleTimeString('es-GT', { ...optsZona, hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                    <td style={{ ...TD, fontWeight: 500 }}>
                      {v.usuario?.nombre_completo || '—'}
                    </td>
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <span style={{ background: '#DFF4F7', color: '#3A6E9E', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>
                        {v.detalle_venta?.length || 0}
                      </span>
                    </td>
                    <td style={{ ...TD, fontWeight: 700, color: '#1A3A5C' }}>
                      Q {parseFloat(v.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={TD}>
                      <MetodoPill metodo={v.metodo_pago} />
                    </td>
                    <td style={TD}>
                      <EstadoPill estado={v.estado} />
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