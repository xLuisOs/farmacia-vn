import React, { useEffect, useState } from 'react'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import * as XLSX from 'xlsx'
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, 
  FiCalendar, FiRefreshCw, FiDownload
} from 'react-icons/fi'
import { supabase } from '../packages/supabase'

const ZONA = 'America/Guatemala'

export default function IngresosVsEgresos({ darkMode }) {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tiempoFiltro, setTiempoFiltro] = useState('mes')
  const [resumen, setResumen] = useState({
    ingresosTotales: 0, egresosTotales: 0, neto: 0, margenGanancia: 0
  })

  useEffect(() => { fetchDatos() }, [tiempoFiltro])

  async function fetchDatos() {
    try {
      setLoading(true)
      const hoy = new Date()
      let fechaInicio = new Date()
      if (tiempoFiltro === 'semana') fechaInicio.setDate(hoy.getDate() - 7)
      else if (tiempoFiltro === 'mes') fechaInicio.setMonth(hoy.getMonth() - 1)
      else if (tiempoFiltro === 'año') fechaInicio.setFullYear(hoy.getFullYear() - 1)

      const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
      const fechaHoyStr = hoy.toISOString().split('T')[0]

      const { data: ventas } = await supabase.schema('farmacia').from('venta')
        .select('fecha, total').gte('fecha', fechaInicioStr).lte('fecha', fechaHoyStr)

      const { data: compras } = await supabase.schema('farmacia').from('compra')
        .select('fecha, total').gte('fecha', fechaInicioStr).lte('fecha', fechaHoyStr)

      const datosAgrupados = procesarDatos(ventas || [], compras || [])
      const ingresosTotales = (ventas || []).reduce((sum, v) => sum + (v.total || 0), 0)
      const egresosTotales = (compras || []).reduce((sum, c) => sum + (c.total || 0), 0)
      const neto = ingresosTotales - egresosTotales
      const margenGanancia = ingresosTotales > 0 ? ((neto / ingresosTotales) * 100).toFixed(2) : 0

      setResumen({ ingresosTotales, egresosTotales, neto, margenGanancia })
      setDatos(datosAgrupados)
    } catch (err) {
      console.error('Error al cargar datos:', err.message)
    } finally {
      setLoading(false)
    }
  }

  function procesarDatos(ventas, compras) {
    const mapa = {}
    ventas.forEach(v => {
      const key = v.fecha.split('T')[0]
      if (!mapa[key]) mapa[key] = { fecha: key, ingresos: 0, egresos: 0 }
      mapa[key].ingresos += v.total || 0
    })
    compras.forEach(c => {
      const key = c.fecha.split('T')[0]
      if (!mapa[key]) mapa[key] = { fecha: key, ingresos: 0, egresos: 0 }
      mapa[key].egresos += c.total || 0
    })
    return Object.values(mapa).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(-30)
  }

  const exportarExcel = () => {
    const periodos = { semana: 'Última Semana', mes: 'Último Mes', año: 'Último Año' }
    const wb = XLSX.utils.book_new()

    const datosResumen = [
      ['REPORTE DE INGRESOS VS EGRESOS', '', '', ''],
      ['Período:', periodos[tiempoFiltro], '', ''],
      ['Generado:', new Date().toLocaleDateString('es-GT'), '', ''],
      ['', '', '', ''],
      ['RESUMEN GENERAL', '', '', ''],
      ['Concepto', 'Monto (Q)', '', ''],
      ['Ingresos Totales', resumen.ingresosTotales, '', ''],
      ['Egresos Totales', resumen.egresosTotales, '', ''],
      ['Neto', resumen.neto, '', ''],
      ['Margen de Ganancia', resumen.margenGanancia + '%', '', ''],
      ['', '', '', ''],
      ['DETALLE POR FECHA', '', '', ''],
      ['Fecha', 'Ingresos (Q)', 'Egresos (Q)', 'Neto (Q)'],
      ...(datos || []).map(d => {
        const [fy, fm, fd] = d.fecha.split('-').map(Number)
        return [
          `${String(fd).padStart(2,'0')}/${String(fm).padStart(2,'0')}/${fy}`,
          d.ingresos,
          d.egresos,
          d.ingresos - d.egresos
        ]
      })
    ]

    const ws = XLSX.utils.aoa_to_sheet(datosResumen)
    ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
    ;['B7', 'B8', 'B9'].forEach(cell => { if (ws[cell]) ws[cell].z = '"Q"#,##0.00' })
    XLSX.utils.book_append_sheet(wb, ws, 'Ingresos vs Egresos')
    XLSX.writeFile(wb, `Ingresos_Egresos_${tiempoFiltro}_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: darkMode ? '#1a1f2e' : '#F0F8FA' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#1A3A5C', borderBottomColor: '#5BBFCC', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const datosDistribucion = [
    { name: 'Ingresos', value: resumen.ingresosTotales, color: '#10B981' },
    { name: 'Egresos', value: resumen.egresosTotales, color: '#EF4444' }
  ]

  return (
    <div style={{ padding: 16, background: darkMode ? '#1a1f2e' : '#F0F8FA' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Ingresos vs Egresos</div>
            <div style={{ fontSize: 13, color: darkMode ? '#a0aec0' : '#6A9BB5', marginTop: 4 }}>Análisis comparativo de ingresos y egresos</div>
        </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={fetchDatos} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, background: darkMode ? '#1a2332' : 'white', color: darkMode ? '#a0aec0' : '#1A3A5C', fontFamily: 'inherit' }}
            >
              <FiRefreshCw size={13} />
            </button>
            <button onClick={exportarExcel} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, background: darkMode ? '#1a2332' : 'white', color: darkMode ? '#a0aec0' : '#1A3A5C', fontFamily: 'inherit' }}
            >
              <FiDownload size={13} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['semana', 'mes', 'año'].map(periodo => (
            <button
              key={periodo}
              onClick={() => setTiempoFiltro(periodo)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                background: tiempoFiltro === periodo ? '#1A3A5C' : (darkMode ? '#2d3f60' : '#ffffff'),
                color: tiempoFiltro === periodo ? '#ffffff' : (darkMode ? '#a0aec0' : '#6A9BB5'),
                border: `1px solid ${tiempoFiltro === periodo ? '#1A3A5C' : (darkMode ? '#2d3f60' : '#E2F0F4')}`,
              }}
            >
              {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Ingresos Totales', value: `Q ${resumen.ingresosTotales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, color: '#10B981', bg: '#D1FAE5', icon: <FiTrendingUp size={22} style={{ color: '#059669' }} /> },
            { label: 'Egresos Totales',  value: `Q ${resumen.egresosTotales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,  color: '#EF4444', bg: '#FEE2E2', icon: <FiTrendingDown size={22} style={{ color: '#DC2626' }} /> },
            { label: 'Neto',             value: `Q ${resumen.neto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,             color: resumen.neto >= 0 ? '#10B981' : '#EF4444', bg: resumen.neto >= 0 ? '#D1FAE5' : '#FEE2E2', icon: <FiDollarSign size={22} style={{ color: resumen.neto >= 0 ? '#059669' : '#DC2626' }} /> },
            { label: 'Margen de Ganancia', value: `${resumen.margenGanancia}%`,                                                        color: '#5BBFCC', bg: '#E0F2FE', icon: <FiCalendar size={22} style={{ color: '#0284C7' }} /> },
          ].map(c => (
            <div key={c.label} style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, padding: '18px 16px', border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: darkMode ? '#a0aec0' : '#6A9BB5', marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 10, background: c.bg }}>{c.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', margin: '0 0 16px' }}>Tendencia Ingresos vs Egresos</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={datos || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d3f60' : '#E2F0F4'} />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: darkMode ? '#a0aec0' : '#6A9BB5' }} stroke={darkMode ? '#2d3f60' : '#E2F0F4'} />
                <YAxis tick={{ fontSize: 10, fill: darkMode ? '#a0aec0' : '#6A9BB5' }} stroke={darkMode ? '#2d3f60' : '#E2F0F4'} />
                <Tooltip contentStyle={{ background: darkMode ? '#1a2332' : '#ffffff', border: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }} formatter={v => `Q ${v.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#10B981" strokeWidth={2} dot={false} name="Ingresos" />
                <Line type="monotone" dataKey="egresos" stroke="#EF4444" strokeWidth={2} dot={false} name="Egresos" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', margin: '0 0 16px' }}>Comparativa por Período</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={datos || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d3f60' : '#E2F0F4'} />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: darkMode ? '#a0aec0' : '#6A9BB5' }} stroke={darkMode ? '#2d3f60' : '#E2F0F4'} />
                <YAxis tick={{ fontSize: 10, fill: darkMode ? '#a0aec0' : '#6A9BB5' }} stroke={darkMode ? '#2d3f60' : '#E2F0F4'} />
                <Tooltip contentStyle={{ background: darkMode ? '#1a2332' : '#ffffff', border: `1px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}` }} formatter={v => `Q ${v.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" />
                <Bar dataKey="egresos" fill="#EF4444" name="Egresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}
        <div style={{ background: darkMode ? '#1a2332' : 'white', borderRadius: 12, border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C', margin: '0 0 16px' }}>Distribución de Ingresos y Egresos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={datosDistribucion} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                {datosDistribucion.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={v => `Q ${v.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}