import React, { useEffect, useState } from 'react'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import * as XLSX from 'xlsx'
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, 
  FiCalendar, FiFilter, FiRefreshCw, FiDownload
} from 'react-icons/fi'
import { supabase } from '../packages/supabase'

const ZONA = 'America/Guatemala'
const toUTC = (f) => new Date(f.endsWith('Z') ? f : f + 'Z')
const fmtFecha = (d) => d.toLocaleDateString('es-GT', { timeZone: ZONA, day: '2-digit', month: '2-digit', year: 'numeric' })

const COLORES = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6']

export default function IngresosVsEgresos({ darkMode }) {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tiempoFiltro, setTiempoFiltro] = useState('mes') // 'semana', 'mes', 'año'
  const [resumen, setResumen] = useState({
    ingresosTotales: 0,
    egresosTotales: 0,
    neto: 0,
    margenGanancia: 0
  })

  useEffect(() => {
    fetchDatos()
  }, [tiempoFiltro])

  async function fetchDatos() {
    try {
      setLoading(true)
      const hoy = new Date()
      let fechaInicio = new Date()

      // Calcular el rango de fechas según el filtro
      if (tiempoFiltro === 'semana') {
        fechaInicio.setDate(hoy.getDate() - 7)
      } else if (tiempoFiltro === 'mes') {
        fechaInicio.setMonth(hoy.getMonth() - 1)
      } else if (tiempoFiltro === 'año') {
        fechaInicio.setFullYear(hoy.getFullYear() - 1)
      }

      const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
      const fechaHoyStr = hoy.toISOString().split('T')[0]

      // Obtener ventas (ingresos)
      const { data: ventas } = await supabase
        .schema('farmacia')
        .from('venta')
        .select('fecha, total')
        .gte('fecha', fechaInicioStr)
        .lte('fecha', fechaHoyStr)

      // Obtener compras (egresos)
      const { data: compras } = await supabase
        .schema('farmacia')
        .from('compra')
        .select('fecha, total')
        .gte('fecha', fechaInicioStr)
        .lte('fecha', fechaHoyStr)

      // Procesar datos para gráficos
      const datosAgrupados = procesarDatos(ventas || [], compras || [])
      
      // Calcular resumen
      const ingresosTotales = (ventas || []).reduce((sum, v) => sum + (v.total || 0), 0)
      const egresosTotales = (compras || []).reduce((sum, c) => sum + (c.total || 0), 0)
      const neto = ingresosTotales - egresosTotales
      const margenGanancia = ingresosTotales > 0 ? ((neto / ingresosTotales) * 100).toFixed(2) : 0

      setResumen({
        ingresosTotales,
        egresosTotales,
        neto,
        margenGanancia
      })

      setDatos(datosAgrupados)
    } catch (err) {
      console.error('Error al cargar datos:', err.message)
    } finally {
      setLoading(false)
    }
  }

  function procesarDatos(ventas, compras) {
    const mapa = {}

    // Agrupar ventas por fecha
    ventas.forEach(v => {
      if (!mapa[v.fecha]) mapa[v.fecha] = { fecha: v.fecha, ingresos: 0, egresos: 0 }
      mapa[v.fecha].ingresos += v.total || 0
    })

    // Agrupar compras por fecha
    compras.forEach(c => {
      if (!mapa[c.fecha]) mapa[c.fecha] = { fecha: c.fecha, ingresos: 0, egresos: 0 }
      mapa[c.fecha].egresos += c.total || 0
    })

    return Object.values(mapa)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(-30) // Últimos 30 registros
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: darkMode ? '#1a1f2e' : '#F0F8FA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: '#1A3A5C', borderBottomColor: '#5BBFCC' }}></div>
      </div>
    )
  }

  const datosDistribucion = [
    { name: 'Ingresos', value: resumen.ingresosTotales, color: '#10B981' },
    { name: 'Egresos', value: resumen.egresosTotales, color: '#EF4444' }
  ]

  const exportarExcel = () => {
    const periodos = {
      semana: 'Última Semana',
      mes: 'Último Mes',
      año: 'Último Año'
    }
    const periodoTexto = periodos[tiempoFiltro]
    
    const wb = XLSX.utils.book_new()
    
    // Hoja 1: Resumen
    const datosResumen = [
      ['REPORTE DE INGRESOS VS EGRESOS'],
      [],
      ['Periodo:', periodoTexto],
      [],
      ['RESUMEN GENERAL'],
      ['Concepto', 'Monto (Q)'],
      ['Ingresos Totales', resumen.ingresosTotales.toLocaleString('es-GT', { minimumFractionDigits: 2 })],
      ['Egresos Totales', resumen.egresosTotales.toLocaleString('es-GT', { minimumFractionDigits: 2 })],
      ['Neto', resumen.neto.toLocaleString('es-GT', { minimumFractionDigits: 2 })],
      ['Margen de Ganancia (%)', resumen.margenGanancia + '%'],
      [],
      ['DATOS POR FECHA'],
      ['Fecha', 'Ingresos (Q)', 'Egresos (Q)', 'Neto (Q)'],
      ...(datos || []).map(d => {
        const fechaObj = new Date(d.fecha + 'T00:00:00Z')
        const fechaFormato = fechaObj.toLocaleDateString('es-GT', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })
        return [
          fechaFormato,
          d.ingresos.toLocaleString('es-GT', { minimumFractionDigits: 2 }),
          d.egresos.toLocaleString('es-GT', { minimumFractionDigits: 2 }),
          (d.ingresos - d.egresos).toLocaleString('es-GT', { minimumFractionDigits: 2 })
        ]
      })
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(datosResumen)
    ws1['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')
    
    XLSX.writeFile(wb, `Ingresos_Egresos_${tiempoFiltro}.xlsx`)
  }

  return (
    <div className="min-h-screen p-6" style={{ background: darkMode ? '#1a1f2e' : '#F0F8FA' }}>
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1A3A5C' }}>
              Ingresos vs Egresos
            </h1>
            <p className="text-sm mt-1" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>
              Análisis comparativo de ingresos y egresos
            </p>
          </div>
          <button
            onClick={fetchDatos}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition font-medium"
            style={{ background: '#1A3A5C' }}
            onMouseEnter={(e) => e.target.style.background = '#243a52'}
            onMouseLeave={(e) => e.target.style.background = '#1A3A5C'}
          >
            <FiRefreshCw size={18} />
            Actualizar
          </button>
          <button
            onClick={exportarExcel}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition font-medium"
            style={{ background: '#5BBFCC' }}
            onMouseEnter={(e) => e.target.style.background = '#4da9b8'}
            onMouseLeave={(e) => e.target.style.background = '#5BBFCC'}
            title="Exportar a Excel"
          >
            <FiDownload size={18} />
            Exportar
          </button>
        </div>

        {/* Filtro de tiempo */}
        <div className="flex gap-3 mb-8">
          {['semana', 'mes', 'año'].map(periodo => (
            <button
              key={periodo}
              onClick={() => setTiempoFiltro(periodo)}
              className="px-4 py-2 rounded-lg font-medium transition"
              style={{
                background: tiempoFiltro === periodo ? '#1A3A5C' : (darkMode ? '#2d3f60' : '#ffffff'),
                color: tiempoFiltro === periodo ? '#ffffff' : (darkMode ? '#a0aec0' : '#6A9BB5'),
                border: `1px solid ${tiempoFiltro === periodo ? '#1A3A5C' : (darkMode ? '#2d3f60' : '#E2F0F4')}`,
                cursor: 'pointer'
              }}
            >
              {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </button>
          ))}
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Ingresos */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Ingresos Totales</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#10B981' }}>
                  Q {resumen.ingresosTotales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#D1FAE5' }}>
                <FiTrendingUp style={{ color: '#059669' }} size={24} />
              </div>
            </div>
          </div>

          {/* Egresos */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Egresos Totales</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#EF4444' }}>
                  Q {resumen.egresosTotales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#FEE2E2' }}>
                <FiTrendingDown style={{ color: '#DC2626' }} size={24} />
              </div>
            </div>
          </div>

          {/* Neto */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Neto</p>
                <p className="text-2xl font-bold mt-2" style={{ color: resumen.neto >= 0 ? '#10B981' : '#EF4444' }}>
                  Q {resumen.neto.toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: resumen.neto >= 0 ? '#D1FAE5' : '#FEE2E2' }}>
                <FiDollarSign style={{ color: resumen.neto >= 0 ? '#059669' : '#DC2626' }} size={24} />
              </div>
            </div>
          </div>

          {/* Margen de ganancia */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Margen de Ganancia</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#5BBFCC' }}>
                  {resumen.margenGanancia}%
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#E0F2FE' }}>
                <FiCalendar style={{ color: '#0284C7' }} size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de línea */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#ffffff' : '#1A3A5C' }}>
              Tendencia Ingresos vs Egresos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datos || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#E2F0F4'} />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fontSize: 12 }}
                  stroke={darkMode ? '#888' : '#6A9BB5'}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke={darkMode ? '#888' : '#6A9BB5'}
                />
                <Tooltip 
                  contentStyle={{ background: darkMode ? '#1f2937' : '#ffffff', border: `1px solid ${darkMode ? '#444' : '#E2F0F4'}` }}
                  formatter={(value) => `Q ${value.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}
                />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="egresos" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de barras */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#ffffff' : '#1A3A5C' }}>
              Comparativa por Período
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datos || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#E2F0F4'} />
                <XAxis 
                  dataKey="fecha"
                  tick={{ fontSize: 12 }}
                  stroke={darkMode ? '#888' : '#6A9BB5'}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke={darkMode ? '#888' : '#6A9BB5'}
                />
                <Tooltip 
                  contentStyle={{ background: darkMode ? '#1f2937' : '#ffffff', border: `1px solid ${darkMode ? '#444' : '#E2F0F4'}` }}
                  formatter={(value) => `Q ${value.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}
                />
                <Legend />
                <Bar dataKey="ingresos" fill="#10B981" />
                <Bar dataKey="egresos" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de pastel */}
        <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? '#ffffff' : '#1A3A5C' }}>
            Distribución de Ingresos y Egresos
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosDistribucion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosDistribucion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `Q ${value.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
