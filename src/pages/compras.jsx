import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../packages/supabase'
import {
  FiPlus, FiX, FiTrash2, FiPackage, FiTruck,
  FiCalendar, FiHash, FiDollarSign, FiAlertCircle,
  FiChevronDown, FiRefreshCw, FiUserPlus
} from 'react-icons/fi'

// ─── Estilos base reutilizables ───────────────────────────────────────────────
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
  background: 'white', color: '#1A3A5C',
  border: '1.5px solid #E2F0F4'
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

// ─── Fila de producto en el carrito de compra ─────────────────────────────────
function FilaProducto({ item, index, onUpdate, onRemove }) {
  const subtotal = (parseFloat(item.costo_unitario) || 0) * (parseInt(item.cantidad) || 0)

  return (
    <div style={{
      background: '#F8FCFD', border: '1.5px solid #E2F0F4',
      borderRadius: 10, padding: 14, marginBottom: 8, position: 'relative'
    }}>
      {/* Cabecera de la fila */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1A3A5C' }}>
          {item.nombre_producto}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {subtotal > 0 && (
            <span style={{ fontSize: 13, fontWeight: 800, color: '#3A6E9E' }}>
              Q {subtotal.toFixed(2)}
            </span>
          )}
          <button
            onClick={() => onRemove(index)}
            style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}
          >
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>

      {/* Campos: cantidad, costo, numero_lote, fecha_vencimiento */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 130px 1fr 160px', gap: 8 }}>
        <div>
          <label style={LABEL}>Cantidad</label>
          <input
            type="number" min="1" placeholder="0"
            value={item.cantidad}
            onChange={e => onUpdate(index, 'cantidad', e.target.value)}
            style={{ ...INPUT, borderColor: !item.cantidad ? '#FCA5A5' : '#E2F0F4' }}
          />
        </div>
        <div>
          <label style={LABEL}>Costo unit. (Q)</label>
          <input
            type="number" step="0.01" min="0" placeholder="0.00"
            value={item.costo_unitario}
            onChange={e => onUpdate(index, 'costo_unitario', e.target.value)}
            style={{ ...INPUT, borderColor: !item.costo_unitario ? '#FCA5A5' : '#E2F0F4' }}
          />
        </div>
        <div>
          <label style={LABEL}>N° de lote (fabricante)</label>
          <input
            type="text" placeholder="Ej: LOT-2024-001"
            value={item.numero_lote}
            onChange={e => onUpdate(index, 'numero_lote', e.target.value)}
            style={INPUT}
          />
        </div>
        <div>
          <label style={{ ...LABEL, color: '#E05C6A' }}>Fecha vencimiento *</label>
          <input
            type="date"
            value={item.fecha_vencimiento}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => onUpdate(index, 'fecha_vencimiento', e.target.value)}
            style={{ ...INPUT, borderColor: !item.fecha_vencimiento ? '#FCA5A5' : '#E2F0F4' }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Modal nuevo proveedor ────────────────────────────────────────────────────
function ModalNuevoProveedor({ onClose, onGuardado }) {
  const empty = { nombre: '', contacto: '', telefono: '', direccion: '', email: '', activo: true }
  const [form, setForm] = useState(empty)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.nombre.trim()) { setError('El nombre del proveedor es obligatorio.'); return }
    setGuardando(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('proveedor')
        .insert([{
          nombre: form.nombre.trim(),
          contacto: form.contacto.trim() || null,
          telefono: form.telefono.trim() || null,
          direccion: form.direccion.trim() || null,
          email: form.email.trim() || null,
          activo: form.activo
        }])
      if (err) throw err
      onGuardado()
      onClose()
    } catch (err) {
      setError(err.message || 'Error al guardar el proveedor.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,25,50,.55)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10000, padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 480,
        boxShadow: '0 30px 80px rgba(10,25,50,.25)'
      }}>
        <div style={{
          background: 'linear-gradient(90deg,#1A3A5C,#2A5278)',
          padding: '18px 22px', borderRadius: '18px 18px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>🤝 Nuevo Proveedor</div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ ...LABEL, color: '#E05C6A' }}>Nombre del proveedor *</label>
            <input
              type="text" placeholder="Ej: Distribuidora Farma GT"
              value={form.nombre} onChange={e => set('nombre', e.target.value)}
              style={{ ...INPUT, borderColor: !form.nombre.trim() ? '#FCA5A5' : '#E2F0F4' }}
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL}>Nombre de contacto</label>
              <input type="text" placeholder="Ej: Mario Pérez" value={form.contacto} onChange={e => set('contacto', e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Teléfono</label>
              <input type="text" placeholder="Ej: 5555-1234" value={form.telefono} onChange={e => set('telefono', e.target.value)} style={INPUT} />
            </div>
          </div>

          <div>
            <label style={LABEL}>Correo electrónico</label>
            <input type="email" placeholder="Ej: ventas@proveedor.com" value={form.email} onChange={e => set('email', e.target.value)} style={INPUT} />
          </div>

          <div>
            <label style={LABEL}>Dirección</label>
            <input type="text" placeholder="Dirección física opcional" value={form.direccion} onChange={e => set('direccion', e.target.value)} style={INPUT} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={LABEL}>Estado</label>
            <button
              onClick={() => set('activo', !form.activo)}
              style={{ padding: '5px 14px', borderRadius: 7, border: `1.5px solid ${form.activo ? '#3DBD8A' : '#E05C6A'}`, background: form.activo ? '#DCFCE7' : '#FEE2E2', color: form.activo ? '#166534' : '#991B1B', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {form.activo ? '✅ Activo' : '❌ Inactivo'}
            </button>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #E2F0F4' }}>
            <button onClick={onClose} style={{ ...BTN_SECONDARY, fontFamily: 'inherit' }}>Cancelar</button>
            <button
              onClick={guardar}
              disabled={guardando || !form.nombre.trim()}
              style={{ ...BTN_PRIMARY, background: form.nombre.trim() && !guardando ? '#1A3A5C' : '#E2F0F4', color: form.nombre.trim() && !guardando ? 'white' : '#A8CEDD', fontFamily: 'inherit' }}
            >
              {guardando
                ? <><FiRefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                : <><FiUserPlus size={13} /> Guardar proveedor</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal nueva compra ───────────────────────────────────────────────────────
function ModalNuevaCompra({ proveedores, productos, usuario, onClose, onGuardado }) {
  const [idProveedor, setIdProveedor] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [carrito, setCarrito] = useState([])
  const [prodSeleccionado, setProdSeleccionado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const agregarProducto = () => {
    const prod = productos.find(p => p.id_producto === parseInt(prodSeleccionado))
    if (!prod) return
    // Evitar duplicados
    if (carrito.find(c => c.id_producto === prod.id_producto)) return
    setCarrito(prev => [...prev, {
      id_producto: prod.id_producto,
      nombre_producto: prod.nombre,
      cantidad: '',
      costo_unitario: '',
      numero_lote: '',
      fecha_vencimiento: ''
    }])
    setProdSeleccionado('')
  }

  const actualizarItem = (index, campo, valor) => {
    setCarrito(prev => prev.map((item, i) => i === index ? { ...item, [campo]: valor } : item))
  }

  const eliminarItem = (index) => {
    setCarrito(prev => prev.filter((_, i) => i !== index))
  }

  const total = carrito.reduce((sum, item) => {
    return sum + (parseFloat(item.costo_unitario) || 0) * (parseInt(item.cantidad) || 0)
  }, 0)

  const puedeGuardar = idProveedor &&
    carrito.length > 0 &&
    carrito.every(item =>
      item.cantidad > 0 &&
      item.costo_unitario > 0 &&
      item.fecha_vencimiento
    )

  const guardar = async () => {
    if (!puedeGuardar) return
    setGuardando(true)
    setError(null)

    try {
      // 1. Insertar la compra principal
      const { data: compraData, error: errCompra } = await supabase
        .from('compra')
        .insert([{
          id_proveedor: parseInt(idProveedor),
          id_usuario: usuario.id_usuario,
          total: total,
          observaciones: observaciones || null
        }])
        .select('id_compra')
        .single()

      if (errCompra) throw errCompra

      const id_compra = compraData.id_compra

      // 2. Para cada item: crear lote y luego detalle_compra
      for (const item of carrito) {
        // 2a. Insertar lote (esto dispara el trigger que actualiza stock en producto)
        const { data: loteData, error: errLote } = await supabase
          .from('lote')
          .insert([{
            id_producto: item.id_producto,
            id_compra: id_compra,
            numero_lote: item.numero_lote || null,
            fecha_vencimiento: item.fecha_vencimiento,
            cantidad_inicial: parseInt(item.cantidad),
            cantidad_actual: parseInt(item.cantidad),
            costo_unitario: parseFloat(item.costo_unitario),
            activo: true
          }])
          .select('id_lote')
          .single()

        if (errLote) throw errLote

        // 2b. Insertar detalle_compra vinculado al lote creado
        const subtotal = parseFloat(item.costo_unitario) * parseInt(item.cantidad)
        const { error: errDetalle } = await supabase
          .from('detalle_compra')
          .insert([{
            id_compra: id_compra,
            id_producto: item.id_producto,
            id_lote: loteData.id_lote,
            cantidad: parseInt(item.cantidad),
            costo_unitario: parseFloat(item.costo_unitario),
            subtotal: subtotal
          }])

        if (errDetalle) throw errDetalle
      }

      onGuardado()
      onClose()
    } catch (err) {
      console.error('Error al guardar compra:', err)
      setError(err.message || 'Error al registrar la compra.')
    } finally {
      setGuardando(false)
    }
  }

  const productosDisponibles = productos.filter(
    p => !carrito.find(c => c.id_producto === p.id_producto)
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,25,50,.55)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 720,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 30px 80px rgba(10,25,50,.25)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg,#1A3A5C,#2A5278)',
          padding: '18px 22px', borderRadius: '18px 18px 0 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 1
        }}>
          <div>
            <div style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>🏪 Nueva Orden de Compra</div>
            <div style={{ color: '#7FD4DE', fontSize: 10, marginTop: 2 }}>
              Los lotes se crean automáticamente al guardar
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FiX />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Proveedor + observaciones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={LABEL}>Proveedor *</label>
              <select
                value={idProveedor}
                onChange={e => setIdProveedor(e.target.value)}
                style={{ ...INPUT, borderColor: !idProveedor ? '#FCA5A5' : '#E2F0F4' }}
              >
                <option value="">Seleccionar proveedor...</option>
                {proveedores.filter(p => p.activo).map(p => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL}>Observaciones</label>
              <input
                type="text"
                placeholder="Notas opcionales..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                style={INPUT}
              />
            </div>
          </div>

          {/* Selector para agregar producto */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={LABEL}>Agregar producto al pedido</label>
              <select
                value={prodSeleccionado}
                onChange={e => setProdSeleccionado(e.target.value)}
                style={INPUT}
              >
                <option value="">Seleccionar producto existente en inventario...</option>
                {productosDisponibles.map(p => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre} {p.id_categoria ? `— ${p.categoria_nombre || ''}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={agregarProducto}
              disabled={!prodSeleccionado}
              style={{
                ...BTN_PRIMARY,
                background: prodSeleccionado ? '#5BBFCC' : '#E2F0F4',
                color: prodSeleccionado ? '#1A3A5C' : '#A8CEDD',
                whiteSpace: 'nowrap', padding: '8px 18px'
              }}
            >
              <FiPlus size={14} /> Agregar
            </button>
          </div>

          {/* Carrito de productos */}
          {carrito.length === 0 ? (
            <div style={{
              border: '2px dashed #E2F0F4', borderRadius: 12,
              padding: '30px 20px', textAlign: 'center', color: '#A8CEDD'
            }}>
              <FiPackage size={28} style={{ marginBottom: 8, opacity: .5 }} />
              <div style={{ fontSize: 12 }}>Agrega productos para continuar</div>
              <div style={{ fontSize: 10, marginTop: 4, color: '#C5D9E3' }}>
                Cada producto requiere fecha de vencimiento obligatoria
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>
                📦 Productos en esta compra ({carrito.length})
              </div>
              {carrito.map((item, i) => (
                <FilaProducto
                  key={item.id_producto}
                  item={item}
                  index={i}
                  onUpdate={actualizarItem}
                  onRemove={eliminarItem}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
              padding: '10px 14px', fontSize: 11, color: '#991B1B',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          {/* Total y acciones */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 14, borderTop: '2px dashed #E2F0F4'
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#6A9BB5', fontWeight: 600, textTransform: 'uppercase' }}>
                Total de la orden
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1A3A5C', lineHeight: 1.2 }}>
                Q {total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
              </div>
              {carrito.length > 0 && (
                <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 2 }}>
                  {carrito.length} producto{carrito.length > 1 ? 's' : ''} · {carrito.reduce((s, i) => s + (parseInt(i.cantidad) || 0), 0)} unidades
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ ...BTN_SECONDARY, fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={!puedeGuardar || guardando}
                style={{
                  ...BTN_PRIMARY,
                  background: puedeGuardar && !guardando ? '#1A3A5C' : '#E2F0F4',
                  color: puedeGuardar && !guardando ? 'white' : '#A8CEDD',
                  fontFamily: 'inherit', padding: '8px 20px', gap: 8
                }}
              >
                {guardando ? (
                  <><FiRefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                ) : (
                  <><FiPackage size={13} /> Registrar compra</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Compras({ user }) {
  const [proveedores, setProveedores] = useState([])
  const [compras, setCompras] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: provData }, { data: compData }, { data: prodData }] = await Promise.all([
        supabase.from('proveedor').select('*').order('nombre'),
        supabase
          .from('compra')
          .select(`
            id_compra, fecha, total, observaciones,
            proveedor:id_proveedor ( nombre ),
            usuario:id_usuario ( nombre_completo ),
            detalle_compra ( id_detalle_compra )
          `)
          .order('fecha', { ascending: false })
          .limit(50),
        supabase
          .from('producto')
          .select('id_producto, nombre, id_categoria')
          .eq('activo', true)
          .order('nombre')
      ])

      setProveedores(provData || [])
      setCompras(compData || [])
      setProductos(prodData || [])
    } catch (err) {
      console.error('Error cargando compras:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Stats calculados
  const totalMes = compras
    .filter(c => {
      const fecha = new Date(c.fecha)
      const hoy = new Date()
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
    })
    .reduce((s, c) => s + parseFloat(c.total || 0), 0)

  return (
    <>
      {modalProveedorAbierto && (
        <ModalNuevoProveedor
          onClose={() => setModalProveedorAbierto(false)}
          onGuardado={cargarDatos}
        />
      )}
      {modalAbierto && (
        <ModalNuevaCompra
          proveedores={proveedores}
          productos={productos}
          usuario={user}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarDatos}
        />
      )}

      {/* ─── Header de página ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>Compras</div>
          <div style={{ fontSize: 11, color: '#6A9BB5' }}>
            Registro de órdenes de compra y generación de lotes
          </div>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          style={{ ...BTN_PRIMARY, fontFamily: 'inherit', padding: '9px 18px' }}
        >
          <FiPlus size={14} /> Nueva compra
        </button>
      </div>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Compras este mes', value: compras.filter(c => {
            const f = new Date(c.fecha); const h = new Date()
            return f.getMonth() === h.getMonth() && f.getFullYear() === h.getFullYear()
          }).length, icon: '🏪' },
          { label: 'Gasto del mes', value: `Q ${totalMes.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, icon: '💵' },
          { label: 'Proveedores activos', value: proveedores.filter(p => p.activo).length, icon: '🤝' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 14, border: '1.5px solid #E2F0F4', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F0F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A3A5C' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6A9BB5' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Proveedores ──────────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #E2F0F4', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2F0F4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>🤝 Proveedores</div>
            <span style={{ background: '#1A3A5C', color: 'white', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
              {proveedores.length}
            </span>
          </div>
          <button
            onClick={() => setModalProveedorAbierto(true)}
            style={{ ...BTN_SECONDARY, padding: '5px 12px', fontSize: 10, fontFamily: 'inherit' }}
          >
            <FiUserPlus size={12} /> Nuevo proveedor
          </button>
        </div>
        {proveedores.length === 0 ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: '#A8CEDD', fontSize: 11 }}>
            <FiTruck size={24} style={{ marginBottom: 8, opacity: .4 }} />
            <div>No hay proveedores registrados</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {proveedores.map(p => (
              <div key={p.id_proveedor} style={{ padding: '14px 16px', borderRight: '1px solid #E2F0F4', borderBottom: '1px solid #E2F0F4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A5C' }}>{p.nombre}</div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5,
                    background: p.activo ? '#DCFCE7' : '#FEE2E2',
                    color: p.activo ? '#166534' : '#991B1B'
                  }}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {p.contacto && <div style={{ fontSize: 10, color: '#6A9BB5' }}>👤 {p.contacto}</div>}
                {p.telefono && <div style={{ fontSize: 10, color: '#6A9BB5' }}>📞 {p.telefono}</div>}
                {p.email && <div style={{ fontSize: 10, color: '#6A9BB5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉️ {p.email}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Historial de compras ──────────────────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #E2F0F4', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2F0F4' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>📋 Historial de compras</div>
            <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 1 }}>Últimas 50 órdenes</div>
          </div>
          <button
            onClick={cargarDatos}
            style={{ ...BTN_SECONDARY, padding: '5px 10px', fontSize: 10, fontFamily: 'inherit' }}
          >
            <FiRefreshCw size={11} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD', fontSize: 11 }}>
            Cargando compras...
          </div>
        ) : compras.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#A8CEDD' }}>
            <FiPackage size={28} style={{ marginBottom: 8, opacity: .4 }} />
            <div style={{ fontSize: 12 }}>No hay compras registradas aún</div>
            <div style={{ fontSize: 10, marginTop: 4, color: '#C5D9E3' }}>
              Usa el botón "Nueva compra" para registrar la primera entrada de mercancía
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['# Compra', 'Fecha', 'Proveedor', 'Productos', 'Total', 'Registrado por', 'Observaciones'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compras.map(c => (
                <tr key={c.id_compra} style={{ ':hover': { background: '#F8FCFD' } }}>
                  <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>
                    C-{String(c.id_compra).padStart(4, '0')}
                  </td>
                  <td style={TD}>
                    {new Date(c.fecha).toLocaleDateString('es-GT', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                  </td>
                  <td style={{ ...TD, fontWeight: 500 }}>
                    {c.proveedor?.nombre || '—'}
                  </td>
                  <td style={{ ...TD, textAlign: 'center' }}>
                    <span style={{
                      background: '#DFF4F7', color: '#3A6E9E',
                      padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700
                    }}>
                      {c.detalle_compra?.length || 0}
                    </span>
                  </td>
                  <td style={{ ...TD, fontWeight: 700, color: '#1A3A5C' }}>
                    Q {parseFloat(c.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={TD}>
                    {c.usuario?.nombre_completo || '—'}
                  </td>
                  <td style={{ ...TD, color: '#6A9BB5', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.observaciones || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
