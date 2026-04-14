import { useState } from 'react'
import Card, { CardHeader } from '../components/card'
import { productos as prodData } from '../data/mockData'

const TH = { background: '#F0F8FA', fontSize: 9, fontWeight: 700, color: '#6A9BB5', textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left' }
const TD = { padding: '9px 16px', fontSize: 11, color: '#2d3f60', borderBottom: '1px solid #E2F0F4' }
const BTN = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none' }
const INPUT = { padding: '7px 10px', borderRadius: 7, border: '1.5px solid #E2F0F4', fontSize: 11, color: '#1A3A5C', background: 'white', width: '100%', fontFamily: 'inherit' }

function getEstado(p) {
  if (p.stock === 0) return 'out'
  if (p.stock < p.stockMin) return 'low'
  return 'ok'
}

function StatusPill({ estado }) {
  const map = { ok: ['#DCFCE7', '#166534', 'En stock'], low: ['#FEF9C3', '#854D0E', 'Stock bajo'], out: ['#FEE2E2', '#991B1B', 'Agotado'] }
  const [bg, color, txt] = map[estado]
  return <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: bg, color }}>● {txt}</span>
}

function Modal({ prod, onClose }) {
  const empty = { nombre: '', categoria: '', precio: '', stock: '', stockMin: 10, vencimiento: '' }
  const [form, setForm] = useState(prod ? { ...prod, precio: prod.precio.toString(), stock: prod.stock.toString() } : empty)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 520, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ background: 'linear-gradient(90deg,#1A3A5C,#2A5278)', padding: '16px 20px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{prod ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>NOMBRE DEL PRODUCTO</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>CATEGORÍA</label>
            <input value={form.categoria} onChange={e => set('categoria', e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>PRECIO DE VENTA (Q)</label>
            <input type="number" step="0.01" value={form.precio} onChange={e => set('precio', e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>STOCK ACTUAL</label>
            <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>STOCK MÍNIMO</label>
            <input type="number" value={form.stockMin} onChange={e => set('stockMin', e.target.value)} style={INPUT} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>FECHA DE VENCIMIENTO</label>
            <input type="date" value={form.vencimiento} onChange={e => set('vencimiento', e.target.value)} style={INPUT} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #E2F0F4' }}>
            <button onClick={onClose} style={{ ...BTN, background: 'white', color: '#1A3A5C', border: '1.5px solid #E2F0F4', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={onClose} style={{ ...BTN, background: '#1A3A5C', color: 'white', fontFamily: 'inherit' }}>💾 Guardar producto</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Inventario() {
  const [productos] = useState(prodData)
  const [filtro, setFiltro] = useState('')
  const [modal, setModal] = useState(false)
  const [editProd, setEditProd] = useState(null)

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.categoria.toLowerCase().includes(filtro.toLowerCase())
  )

  const stats = [
    { label: 'Total productos',  value: productos.length,                                          icon: '📦', color: '#5BBFCC' },
    { label: 'En stock',         value: productos.filter(p => p.stock >= p.stockMin).length,       icon: '✅', color: '#3DBD8A' },
    { label: 'Stock bajo',       value: productos.filter(p => p.stock > 0 && p.stock < p.stockMin).length, icon: '⚠️', color: '#F59E0B' },
    { label: 'Agotados',         value: productos.filter(p => p.stock === 0).length,               icon: '❌', color: '#E05C6A' },
  ]

  return (
    <>
      {modal && <Modal prod={editProd} onClose={() => { setModal(false); setEditProd(null) }} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>Inventario</div>
          <div style={{ fontSize: 11, color: '#6A9BB5' }}>Control de productos y stock</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="🔍  Buscar producto..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E2F0F4', fontSize: 11, color: '#1A3A5C', width: 220, background: 'white', fontFamily: 'inherit' }} />
          <button onClick={() => { setEditProd(null); setModal(true) }} style={{ ...BTN, background: '#1A3A5C', color: 'white', fontFamily: 'inherit' }}>➕ Nuevo producto</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 14, border: '1.5px solid #E2F0F4', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A3A5C' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 2 }}>{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="📦 Catálogo de productos" subtitle="Stock en tiempo real" badge={filtrados.length} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Producto', 'Categoría', 'Stock', 'Stock mín.', 'Precio', 'Vencimiento', 'Estado', 'Acciones'].map(h => <th key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => {
              const estado = getEstado(p)
              return (
                <tr key={p.id}>
                  <td style={{ ...TD, fontWeight: 600, color: '#1A3A5C' }}>{p.nombre}</td>
                  <td style={TD}><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#DFF4F7', color: '#3A6E9E' }}>{p.categoria}</span></td>
                  <td style={{ ...TD, fontWeight: estado !== 'ok' ? 700 : 400, color: estado === 'out' ? '#E05C6A' : estado === 'low' ? '#854D0E' : '#2d3f60' }}>{p.stock}</td>
                  <td style={TD}>{p.stockMin}</td>
                  <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>Q {p.precio.toFixed(2)}</td>
                  <td style={TD}>{p.vencimiento || '—'}</td>
                  <td style={TD}><StatusPill estado={estado} /></td>
                  <td style={TD}>
                    <button onClick={() => { setEditProd(p); setModal(true) }} style={{ background: '#EEF1FA', border: 'none', color: '#2A5278', borderRadius: 5, padding: '3px 9px', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ Editar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}