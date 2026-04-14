import { useState } from 'react'
import Card, { CardHeader } from '../components/card'
import { facturas, ventasRecientes } from '../data/mockData'

const TH = { background: '#F0F8FA', fontSize: 9, fontWeight: 700, color: '#6A9BB5', textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left' }
const TD = { padding: '9px 16px', fontSize: 11, color: '#2d3f60', borderBottom: '1px solid #E2F0F4' }
const BTN = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none' }
const INPUT = { padding: '7px 10px', borderRadius: 7, border: '1.5px solid #E2F0F4', fontSize: 11, color: '#1A3A5C', background: 'white', width: '100%', fontFamily: 'inherit' }

function Modal({ onClose }) {
  const [form, setForm] = useState({ venta: '', nit: 'CF', cliente: 'Consumidor Final' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const ventaSeleccionada = ventasRecientes.find(v => v.id === form.venta)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ background: 'linear-gradient(90deg,#1A3A5C,#2A5278)', padding: '16px 20px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>🧾 Emitir Factura</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>VENTA ASOCIADA</label>
            <select value={form.venta} onChange={e => set('venta', e.target.value)} style={INPUT}>
              <option value="">Seleccionar venta...</option>
              {ventasRecientes.filter(v => v.estado === 'COMPLETADA').map(v => (
                <option key={v.id} value={v.id}>{v.id} — {v.fecha} — Q {v.total.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>NIT DEL CLIENTE</label>
            <input value={form.nit} onChange={e => set('nit', e.target.value)} placeholder="Ej: 1234567-8 o CF" style={INPUT} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>NOMBRE DEL CLIENTE</label>
            <input value={form.cliente} onChange={e => set('cliente', e.target.value)} style={INPUT} />
          </div>

          {ventaSeleccionada && (
            <div style={{ background: '#F0F8FA', borderRadius: 10, padding: 14, border: '1px solid #E2F0F4' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', marginBottom: 8 }}>RESUMEN</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: '#3d5280' }}>
                  <div>Venta: <strong>{ventaSeleccionada.id}</strong></div>
                  <div>Fecha: {ventaSeleccionada.fecha} {ventaSeleccionada.hora}</div>
                  <div>Método: {ventaSeleccionada.metodo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#6A9BB5' }}>Total factura</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1A3A5C' }}>Q {ventaSeleccionada.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #E2F0F4' }}>
            <button onClick={onClose} style={{ ...BTN, background: 'white', color: '#1A3A5C', border: '1.5px solid #E2F0F4', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={onClose} disabled={!form.venta} style={{ ...BTN, background: form.venta ? '#1A3A5C' : '#E2F0F4', color: form.venta ? 'white' : '#A8CEDD', fontFamily: 'inherit' }}>🧾 Emitir factura</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Facturacion() {
  const [modal, setModal] = useState(false)

  return (
    <>
      {modal && <Modal onClose={() => setModal(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>Facturación</div>
          <div style={{ fontSize: 11, color: '#6A9BB5' }}>Emisión y registro de facturas</div>
        </div>
        <button onClick={() => setModal(true)} style={{ ...BTN, background: '#1A3A5C', color: 'white', fontFamily: 'inherit' }}>🧾 Emitir factura</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Facturas emitidas hoy', value: facturas.length, icon: '🧾' },
          { label: 'Total facturado hoy',   value: 'Q 395.50',      icon: '💵' },
          { label: 'Facturas CF',           value: '1',             icon: '👤' },
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
        <CardHeader title="🧾 Facturas emitidas" subtitle="Registro del día" badge={facturas.length} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['# Factura', 'Venta', 'Fecha emisión', 'NIT', 'Cliente', 'Total'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {facturas.map(f => (
              <tr key={f.id}>
                <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>{f.id}</td>
                <td style={TD}><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#DFF4F7', color: '#3A6E9E' }}>{f.venta}</span></td>
                <td style={TD}>{f.fecha}</td>
                <td style={TD}>{f.nit}</td>
                <td style={{ ...TD, fontWeight: 500 }}>{f.cliente}</td>
                <td style={{ ...TD, fontWeight: 700, color: '#1A3A5C' }}>Q {f.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}