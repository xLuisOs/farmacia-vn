import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Card, { CardHeader } from '../components/card'
import { alertas, ventasSemanales, topProductos, productos } from '../data/mockData'

function KPICard({ icon, value, label, change, up, accent, iconBg }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 14, border: '1.5px solid #E2F0F4', boxShadow: '0 2px 8px rgba(11,31,75,.05)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ width: 36, height: 36, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1A3A5C', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 9, fontWeight: 600, marginTop: 6, color: up ? '#3DBD8A' : '#E05C6A' }}>{change}</div>
    </div>
  )
}

function StatusPill({ stock, stockMin }) {
  if (stock === 0)          return <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#FEE2E2', color: '#991B1B' }}>● Agotado</span>
  if (stock < stockMin)     return <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#FEF9C3', color: '#854D0E' }}>● Stock bajo</span>
  return                           <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#DCFCE7', color: '#166534' }}>● En stock</span>
}

const TH = { background: '#F0F8FA', fontSize: 9, fontWeight: 700, color: '#6A9BB5', textTransform: 'uppercase', letterSpacing: .8, padding: '8px 16px', textAlign: 'left' }
const TD = { padding: '9px 16px', fontSize: 11, color: '#2d3f60', borderBottom: '1px solid #E2F0F4' }

export default function Dashboard({ setActivePage }) {
  const today = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const fecha = today.charAt(0).toUpperCase() + today.slice(1)

  return (
    <>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C' }}>Dashboard</div>
          <div style={{ fontSize: 11, color: '#6A9BB5' }}>{fecha}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #A8CEDD', background: 'white', color: '#1A3A5C' }}>
            📥 Exportar reporte
          </button>
          <button onClick={() => setActivePage('ventas')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#1A3A5C', color: 'white' }}>
            ➕ Nueva venta
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <KPICard icon="💊" value="68"      label="Ventas del día"        change="▲ 12% vs ayer"        up accent="#2BC5D4" iconBg="#E0F8FA" />
        <KPICard icon="💵" value="Q 4,250" label="Ingresos del día"      change="▲ 8% vs ayer"         up accent="#0B1F4B" iconBg="#EEF1FA" />
        <KPICard icon="⚠️" value="5"       label="Productos stock bajo"  change="▼ Requiere atención"     accent="#F59E0B" iconBg="#FFF8E7" />
        <KPICard icon="📅" value="3"       label="Productos por vencer"  change="▼ En menos de 30 días"   accent="#EF4444" iconBg="#FEE2E2" />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 12 }}>

        {/* Inventario table */}
        <Card>
          <CardHeader title="📦 Estado del Inventario" subtitle="Productos activos en stock" badge="Hoy" badgeCyan />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Producto</th>
                <th style={TH}>Categoría</th>
                <th style={TH}>Stock</th>
                <th style={TH}>Precio</th>
                <th style={TH}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productos.slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td style={TD}><span style={{ fontWeight: 600, color: '#1A3A5C' }}>{p.nombre}</span></td>
                  <td style={TD}><span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: '#DFF4F7', color: '#3A6E9E' }}>{p.categoria}</span></td>
                  <td style={TD}>{p.stock} unid.</td>
                  <td style={{ ...TD, fontWeight: 700, color: '#3A6E9E' }}>Q {p.precio.toFixed(2)}</td>
                  <td style={TD}><StatusPill stock={p.stock} stockMin={p.stockMin} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Alertas */}
          <Card>
            <CardHeader title="🔔 Alertas del Sistema" subtitle="Notificaciones activas" badge={alertas.length} />
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alertas.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#F0F8FA', border: '1px solid #E2F0F4' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: a.tipo === 'danger' ? '#E05C6A' : '#F59E0B', boxShadow: `0 0 5px ${a.tipo === 'danger' ? '#E05C6A' : '#F59E0B'}` }} />
                  <div style={{ fontSize: 10, color: '#3d5280', lineHeight: 1.3, flex: 1 }}>
                    <strong style={{ color: '#1A3A5C' }}>{a.texto.split('.')[0]}.</strong>
                    {a.texto.includes('.') ? ' ' + a.texto.split('.').slice(1).join('.').trim() : ''}
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 9, color: '#6A9BB5', flexShrink: 0 }}>{a.hora}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Gráfica ventas */}
          <Card>
            <CardHeader title="📈 Ventas – Esta semana" />
            <div style={{ padding: '14px 16px 10px' }}>
              <ResponsiveContainer width="100%" height={95}>
                <BarChart data={ventasSemanales} barGap={2}>
                  <XAxis dataKey="dia" tick={{ fontSize: 8, fill: '#6A9BB5' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, border: '1px solid #E2F0F4' }} formatter={(v, n) => [n === 'ventas' ? `${v} ventas` : `Q ${v}`, n === 'ventas' ? 'Ventas' : 'Ingresos']} />
                  <Bar dataKey="ventas"   fill="#3A6E9E" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="ingresos" fill="#5BBFCC" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 9, color: '#6A9BB5' }}>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#3A6E9E', marginRight: 3 }} />Ventas</span>
                <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#5BBFCC', marginRight: 3 }} />Ingresos</span>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Top productos */}
        <Card>
          <CardHeader title="🏆 Productos con mayor rotación" />
          <div>
            {topProductos.map(p => (
              <div key={p.pos} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', borderBottom: '1px solid #E2F0F4' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: '#1A3A5C', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.pos}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1A3A5C' }}>{p.nombre}</div>
                  <div style={{ fontSize: 9, color: '#6A9BB5' }}>Vendidos este mes: {p.unidades} unid.</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#3A6E9E' }}>Q {p.ingresos.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ingresos vs Egresos */}
        <Card>
          <CardHeader title="💰 Ingresos vs. Egresos (mes)" />
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Ingresos por ventas',       amount: 'Q 28,450', pct: 85, color: '#5BBFCC' },
              { label: 'Compras a proveedores',      amount: 'Q 14,200', pct: 42, color: '#3A6E9E' },
              { label: 'Pérdidas por vencimiento',   amount: 'Q 1,800',  pct: 18, color: '#F59E0B' },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#3d5280' }}>{row.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#1A3A5C' }}>{row.amount}</span>
                </div>
                <div style={{ height: 6, borderRadius: 10, background: '#E2F0F4', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 10, background: row.color, width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #E2F0F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6A9BB5' }}>Utilidad neta estimada</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#3DBD8A' }}>Q 12,450</span>
            </div>
          </div>
        </Card>

      </div>
    </>
  )
}