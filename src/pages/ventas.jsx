import { useState } from 'react'
import Card, { CardHeader } from '../components/card'
import { ventasRecientes, productos } from '../data/mockData'

const TH = { background: '#F0F8FA', fontSize: 9, fontWeight: 700, color: '#6A9BB5', textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left' }
const TD = { padding: '9px 16px', fontSize: 11, color: '#2d3f60', borderBottom: '1px solid #E2F0F4' }
const BTN = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none' }
const INPUT_STYLE = { padding: '7px 10px', borderRadius: 7, border: '1.5px solid #E2F0F4', fontSize: 11, color: '#1A3A5C', background: 'white', width: '100%', fontFamily: 'inherit' }

function MetodoPill({ metodo }) {
  const map = { Efectivo: ['#DCFCE7', '#166534'], Tarjeta: ['#EFF6FF', '#1D4ED8'], Transferencia: ['#F3E8FF', '#7E22CE'] }
  const [bg, color] = map[metodo] || ['#F0F8FA', '#1A3A5C']
  return <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: bg, color }}>{metodo}</span>
}

function EstadoPill({ estado }) {
  return <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: estado === 'COMPLETADA' ? '#DCFCE7' : '#FEE2E2', color: estado === 'COMPLETADA' ? '#166534' : '#991B1B' }}>{estado}</span>
}

function Modal({ onClose }) {
  const [carrito, setCarrito] = useState([])
  const [selProd, setSelProd] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [metodo, setMetodo] = useState('Efectivo')

  const agregar = () => {
    const prod = productos.find(p => p.id === parseInt(selProd))
    if (!prod) return
    const existe = carrito.find(c => c.id === prod.id)
    if (existe) {
      setCarrito(carrito.map(c => c.id === prod.id ? { ...c, cantidad: c.cantidad + parseInt(cantidad) } : c))
    } else {
      setCarrito([...carrito, { ...prod, cantidad: parseInt(cantidad) }])
    }
    setSelProd(''); setCantidad(1)
  }

  const total = carrito.reduce((s, c) => s + c.precio * c.cantidad, 0)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 560, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>

        {/* Header modal */}
        <div style={{ background: 'linear-gradient(90deg,#1A3A5C,#2A5278)', padding: '16px 20px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>🛒 Nueva Venta</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Agregar producto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>PRODUCTO</label>
              <select value={selProd} onChange={e => setSelProd(e.target.value)} style={{ ...INPUT_STYLE }}>
                <option value="">Seleccionar producto...</option>
                {productos.filter(p => p.stock > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — Q{p.precio.toFixed(2)} ({p.stock} disp.)</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>CANT.</label>
              <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} style={{ ...INPUT_STYLE }} />
            </div>
            <button onClick={agregar} disabled={!selProd} style={{ ...BTN, background: selProd ? '#5BBFCC' : '#E2F0F4', color: selProd ? '#1A3A5C' : '#A8CEDD', justifyContent: 'center', fontFamily: 'inherit' }}>
              + Agregar
            </button>
          </div>

          {/* Carrito */}
          {carrito.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #E2F0F4', borderRadius: 10, overflow: 'hidden' }}>
              <thead>
                <tr>
                  {['Producto', 'Precio', 'Cant.', 'Subtotal', ''].map(h => <th key={h} style={TH}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {carrito.map(item => (
                  <tr key={item.id}>
                    <td style={{ ...TD, fontWeight: 600, color: '#1A3A5C' }}>{item.nombre}</td>
                    <td style={TD}>Q {item.precio.toFixed(2)}</td>
                    <td style={TD}>{item.cantidad}</td>
                    <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>Q {(item.precio * item.cantidad).toFixed(2)}</td>
                    <td style={TD}>
                      <button onClick={() => setCarrito(carrito.filter(c => c.id !== item.id))} style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', borderRadius: 5, padding: '2px 7px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Método y total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px dashed #E2F0F4' }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 6 }}>MÉTODO DE PAGO</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Efectivo', 'Tarjeta', 'Transferencia'].map(m => (
                  <button key={m} onClick={() => setMetodo(m)} style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${metodo === m ? '#1A3A5C' : '#E2F0F4'}`, background: metodo === m ? '#1A3A5C' : 'white', color: metodo === m ? 'white' : '#6A9BB5', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#6A9BB5' }}>Total a cobrar</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1A3A5C' }}>Q {total.toFixed(2)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ ...BTN, background: 'white', color: '#1A3A5C', border: '1.5px solid #E2F0F4', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={onClose} disabled={carrito.length === 0} style={{ ...BTN, background: carrito.length > 0 ? '#3DBD8A' : '#E2F0F4', color: carrito.length > 0 ? 'white' : '#A8CEDD', fontFamily: 'inherit' }}>✅ Confirmar venta</button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function Ventas() {
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState('')

  const filtradas = ventasRecientes.filter(v =>
    v.id.toLowerCase().includes(filtro.toLowerCase()) ||
    v.cajero.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <>
      {modal && <Modal onClose={() => setModal(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>Ventas</div>
          <div style={{ fontSize: 11, color: '#6A9BB5' }}>Registro y gestión de ventas</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="🔍  Buscar venta..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E2F0F4', fontSize: 11, color: '#1A3A5C', width: 200, background: 'white', fontFamily: 'inherit' }} />
          <button onClick={() => setModal(true)} style={{ ...BTN, background: '#1A3A5C', color: 'white', fontFamily: 'inherit' }}>➕ Nueva venta</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Ventas hoy',      value: '68',      icon: '🛒' },
          { label: 'Ingresos hoy',    value: 'Q 4,250', icon: '💵' },
          { label: 'Ticket promedio', value: 'Q 62.50', icon: '📊' },
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

      <Card>
        <CardHeader title="🛒 Ventas recientes" subtitle="Historial del día" badge={filtradas.length} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['# Venta', 'Fecha', 'Hora', 'Cajero', 'Productos', 'Total', 'Método', 'Estado'].map(h => <th key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtradas.map(v => (
              <tr key={v.id}>
                <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>{v.id}</td>
                <td style={TD}>{v.fecha}</td>
                <td style={TD}>{v.hora}</td>
                <td style={{ ...TD, fontWeight: 500 }}>{v.cajero}</td>
                <td style={{ ...TD, textAlign: 'center' }}>{v.productos}</td>
                <td style={{ ...TD, fontWeight: 700, color: '#1A3A5C' }}>Q {v.total.toFixed(2)}</td>
                <td style={TD}><MetodoPill metodo={v.metodo} /></td>
                <td style={TD}><EstadoPill estado={v.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}