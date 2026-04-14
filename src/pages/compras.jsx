import { useState } from 'react'
import Card, { CardHeader } from '../components/card'
import { compras, proveedores, productos } from '../data/mockData'

const TH = { background: '#F0F8FA', fontSize: 9, fontWeight: 700, color: '#6A9BB5', textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left' }
const TD = { padding: '9px 16px', fontSize: 11, color: '#2d3f60', borderBottom: '1px solid #E2F0F4' }
const BTN = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none' }
const INPUT = { padding: '7px 10px', borderRadius: 7, border: '1.5px solid #E2F0F4', fontSize: 11, color: '#1A3A5C', background: 'white', width: '100%', fontFamily: 'inherit' }

function Modal({ onClose }) {
  const [proveedor, setProveedor] = useState('')
  const [carrito, setCarrito] = useState([])
  const [selProd, setSelProd] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [costo, setCosto] = useState('')

  const agregar = () => {
    const prod = productos.find(p => p.id === parseInt(selProd))
    if (!prod || !costo) return
    setCarrito([...carrito, { ...prod, cantidad: parseInt(cantidad), costo: parseFloat(costo) }])
    setSelProd(''); setCantidad(1); setCosto('')
  }

  const total = carrito.reduce((s, c) => s + c.costo * c.cantidad, 0)
  const puedeGuardar = carrito.length > 0 && proveedor

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 580, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ background: 'linear-gradient(90deg,#1A3A5C,#2A5278)', padding: '16px 20px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>🏪 Nueva Compra a Proveedor</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>PROVEEDOR</label>
            <select value={proveedor} onChange={e => setProveedor(e.target.value)} style={INPUT}>
              <option value="">Seleccionar proveedor...</option>
              {proveedores.filter(p => p.activo).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 90px', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>PRODUCTO</label>
              <select value={selProd} onChange={e => setSelProd(e.target.value)} style={INPUT}>
                <option value="">Seleccionar...</option>
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>CANT.</label>
              <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>COSTO U. (Q)</label>
              <input type="number" step="0.01" placeholder="0.00" value={costo} onChange={e => setCosto(e.target.value)} style={INPUT} />
            </div>
            <button onClick={agregar} disabled={!selProd || !costo} style={{ ...BTN, background: selProd && costo ? '#5BBFCC' : '#E2F0F4', color: selProd && costo ? '#1A3A5C' : '#A8CEDD', justifyContent: 'center', fontFamily: 'inherit' }}>
              + Agregar
            </button>
          </div>

          {carrito.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #E2F0F4', borderRadius: 10 }}>
              <thead><tr>{['Producto', 'Cant.', 'Costo U.', 'Subtotal', ''].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {carrito.map((item, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, fontWeight: 600, color: '#1A3A5C' }}>{item.nombre}</td>
                    <td style={TD}>{item.cantidad}</td>
                    <td style={TD}>Q {item.costo.toFixed(2)}</td>
                    <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>Q {(item.costo * item.cantidad).toFixed(2)}</td>
                    <td style={TD}><button onClick={() => setCarrito(carrito.filter((_, j) => j !== i))} style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', borderRadius: 5, padding: '2px 7px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px dashed #E2F0F4' }}>
            <span style={{ fontSize: 13, color: '#6A9BB5' }}>Total de la compra</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#1A3A5C' }}>Q {total.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ ...BTN, background: 'white', color: '#1A3A5C', border: '1.5px solid #E2F0F4', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={onClose} disabled={!puedeGuardar} style={{ ...BTN, background: puedeGuardar ? '#1A3A5C' : '#E2F0F4', color: puedeGuardar ? 'white' : '#A8CEDD', fontFamily: 'inherit' }}>💾 Registrar compra</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Compras() {
  const [modal, setModal] = useState(false)

  return (
    <>
      {modal && <Modal onClose={() => setModal(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>Compras</div>
          <div style={{ fontSize: 11, color: '#6A9BB5' }}>Órdenes de compra a proveedores</div>
        </div>
        <button onClick={() => setModal(true)} style={{ ...BTN, background: '#1A3A5C', color: 'white', fontFamily: 'inherit' }}>➕ Nueva compra</button>
      </div>

      {/* Proveedores */}
      <Card>
        <CardHeader title="🏪 Proveedores registrados" badge={proveedores.length} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {proveedores.map(p => (
            <div key={p.id} style={{ padding: '14px 16px', borderRight: '1px solid #E2F0F4', borderBottom: '1px solid #E2F0F4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3A5C' }}>{p.nombre}</div>
                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: p.activo ? '#DCFCE7' : '#FEE2E2', color: p.activo ? '#166534' : '#991B1B' }}>{p.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div style={{ fontSize: 10, color: '#6A9BB5' }}>👤 {p.contacto}</div>
              <div style={{ fontSize: 10, color: '#6A9BB5' }}>📞 {p.telefono}</div>
              <div style={{ fontSize: 10, color: '#6A9BB5' }}>✉️ {p.email}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Historial */}
      <Card>
        <CardHeader title="📋 Historial de compras" subtitle="Últimas órdenes registradas" badge={compras.length} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['# Compra', 'Fecha', 'Proveedor', 'Productos', 'Total', 'Registrado por'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {compras.map(c => (
              <tr key={c.id}>
                <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>{c.id}</td>
                <td style={TD}>{c.fecha}</td>
                <td style={{ ...TD, fontWeight: 500 }}>{c.proveedor}</td>
                <td style={{ ...TD, textAlign: 'center' }}>{c.productos}</td>
                <td style={{ ...TD, fontWeight: 700, color: '#1A3A5C' }}>Q {c.total.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                <td style={TD}>{c.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}