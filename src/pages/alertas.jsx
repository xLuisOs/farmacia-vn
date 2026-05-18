import React, { useEffect, useState } from 'react'
import { 
  FiAlertCircle, FiClock, FiPackage, FiX, FiRefreshCw, 
  FiFilter, FiCheckCircle
} from 'react-icons/fi'
import { supabase } from '../packages/supabase'
import { verificarAlertas } from '../utils/alertUtils'

const ZONA = 'America/Guatemala'
const fmtFecha = (d) => d.toLocaleDateString('es-GT', { timeZone: ZONA, day: '2-digit', month: '2-digit', year: 'numeric' })
const parseFecha = (str) => new Date(str.split('T')[0] + 'T00:00:00Z')

export default function Alertas({ darkMode, setHasNewAlerts }) {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('todos') // 'todos', 'vencimiento', 'stock'
  const [estadisticas, setEstadisticas] = useState({
    totalAlertas: 0,
    vencimiento: 0,
    stockBajo: 0,
    criticas: 0
  })

  useEffect(() => {
    fetchAlertas()
  }, [])

  async function fetchAlertas() {
    try {
      setLoading(true)
      const hoy = new Date()
      const hoySoloFecha = hoy.toISOString().split('T')[0]
      const proximoMes = new Date(hoy)
      proximoMes.setDate(proximoMes.getDate() + 30)
      const proximoMesFecha = proximoMes.toISOString().split('T')[0]

      const alertasArray = []
      let estadisticas = {
        vencimiento: 0,
        stockBajo: 0,
        criticas: 0
      }

      // 1. Obtener lotes por vencer (en los próximos 30 días)
      const { data: lotes } = await supabase
        .schema('farmacia')
        .from('lote')
        .select(`
          id_lote,
          numero_lote,
          fecha_vencimiento,
          cantidad_actual,
          producto (nombre),
          id_producto
        `)
        .eq('activo', true)
        .gt('cantidad_actual', 0)
        .lte('fecha_vencimiento', proximoMesFecha)
        .gte('fecha_vencimiento', hoySoloFecha)

      if (lotes && lotes.length > 0) {
        lotes.forEach(lote => {
          const fechaVenc = parseFecha(lote.fecha_vencimiento)
          const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24))
          
          let severidad = 'advertencia'
          if (diasRestantes <= 7) severidad = 'critica'
          if (diasRestantes <= 0) severidad = 'vencido'

          alertasArray.push({
            id: `venc-${lote.id_lote}`,
            tipo: 'vencimiento',
            severidad,
            producto: lote.producto?.nombre || 'Producto desconocido',
            detalles: `Lote #${lote.numero_lote}`,
            valor: lote.cantidad_actual,
            unidad: 'unidades',
            fecha: lote.fecha_vencimiento,
            diasRestantes,
            mensaje: diasRestantes <= 0 
              ? `Vencido hace ${Math.abs(diasRestantes)} días`
              : `Vence en ${diasRestantes} días`
          })

          estadisticas.vencimiento++
          if (severidad === 'critica' || severidad === 'vencido') {
            estadisticas.criticas++
          }
        })
      }

      // 2. Obtener productos con stock bajo usando la vista
      const { data: todosProductos } = await supabase
        .schema('farmacia')
        .from('vista_stock_actual')
        .select('*')

      if (todosProductos && todosProductos.length > 0) {
        // Filtrar solo los que tienen stock bajo
        const productosBajo = todosProductos.filter(p => p.stock_actual < p.stock_minimo)
        
        productosBajo.forEach(prod => {
          const faltante = prod.stock_minimo - prod.stock_actual
          const porcentajeDeficit = (faltante / prod.stock_minimo) * 100

          alertasArray.push({
            id: `stock-${prod.id_producto}`,
            tipo: 'stock',
            severidad: porcentajeDeficit > 50 ? 'critica' : 'advertencia',
            producto: prod.producto,
            detalles: `Stock actual: ${prod.stock_actual}`,
            valor: faltante,
            unidad: 'unidades',
            stockActual: prod.stock_actual,
            stockMinimo: prod.stock_minimo,
            mensaje: `Faltarían ${faltante} unidades para alcanzar el mínimo`
          })

          estadisticas.stockBajo++
          if (porcentajeDeficit > 50) {
            estadisticas.criticas++
          }
        })
      }

      setEstadisticas({
        totalAlertas: alertasArray.length,
        ...estadisticas
      })

      // Ordenar por severidad y fecha
      alertasArray.sort((a, b) => {
        const severidadOrder = { vencido: 0, critica: 1, advertencia: 2 }
        return severidadOrder[a.severidad] - severidadOrder[b.severidad]
      })

      setAlertas(alertasArray)
      
      // Detectar si hay nuevas alertas
      if (alertasArray.length > 0 && verificarAlertas()) {
        setHasNewAlerts(true)
      }
    } catch (err) {
      console.error('Error al cargar alertas:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const alertasFiltradas = alertas.filter(alerta => {
    if (filtroTipo === 'todos') return true
    return alerta.tipo === filtroTipo
  })

  const getSeveridadColor = (severidad) => {
    switch (severidad) {
      case 'vencido': return '#EF4444'
      case 'critica': return '#F97316'
      case 'advertencia': return '#FBBF24'
      default: return '#6B7280'
    }
  }

  const getSeveridadBg = (severidad) => {
    switch (severidad) {
      case 'vencido': return '#FEE2E2'
      case 'critica': return '#FFEDD5'
      case 'advertencia': return '#FEF3C7'
      default: return '#F3F4F6'
    }
  }

  const getSeveridadBorder = (severidad) => {
    switch (severidad) {
      case 'vencido': return '#FCA5A5'
      case 'critica': return '#FBCF97'
      case 'advertencia': return '#FCD34D'
      default: return '#D1D5DB'
    }
  }

  const getSeveridadBgDark = (severidad) => {
    switch (severidad) {
      case 'vencido': return 'bg-red-900/20 border-red-800'
      case 'critica': return 'bg-orange-900/20 border-orange-800'
      case 'advertencia': return 'bg-yellow-900/20 border-yellow-800'
      default: return 'bg-gray-800 border-gray-700'
    }
  }

  const getSeveridadIconColor = (severidad) => {
    switch (severidad) {
      case 'vencido': return '#DC2626'
      case 'critica': return '#EA580C'
      case 'advertencia': return '#D97706'
      default: return '#4B5563'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: darkMode ? '#0f1419' : '#F0F8FA' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: '#1A3A5C', borderBottomColor: '#5BBFCC' }}></div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, background: darkMode ? '#1a1f2e' : '#F0F8FA' }}>
      <div>
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Alertas del Sistema</div>
            <div style={{ fontSize: 13, color: darkMode ? '#a0aec0' : '#6A9BB5', marginTop: 4 }}>Monitoreo de vencimientos y stock bajo</div>
          </div>
          <button onClick={fetchAlertas} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            border: `1.5px solid ${darkMode ? '#2d3f60' : '#E2F0F4'}`,
            background: darkMode ? '#1a2332' : 'white',
            color: darkMode ? '#a0aec0' : '#1A3A5C',
            fontFamily: 'inherit'
            }}>
              <FiRefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}}/>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total de alertas */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Total de Alertas</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#5BBFCC' }}>
                  {estadisticas.totalAlertas}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#E0F2FE' }}>
                <FiAlertCircle size={24} style={{ color: '#0284C7' }} />
              </div>
            </div>
          </div>

          {/* Alertas críticas */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Críticas</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#DC2626' }}>
                  {estadisticas.criticas}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#FEE2E2' }}>
                <FiAlertCircle size={24} style={{ color: '#DC2626' }} />
              </div>
            </div>
          </div>

          {/* Vencimientos */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Vencimientos</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#F97316' }}>
                  {estadisticas.vencimiento}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#FFEDD5' }}>
                <FiClock size={24} style={{ color: '#EA580C' }} />
              </div>
            </div>
          </div>

          {/* Stock bajo */}
          <div className="p-6 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Stock Bajo</p>
                <p className="text-2xl font-bold mt-2" style={{ color: '#FBBF24' }}>
                  {estadisticas.stockBajo}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: '#FEF3C7' }}>
                <FiPackage size={24} style={{ color: '#D97706' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-8">
          {[
            { valor: 'todos', label: 'Todas' },
            { valor: 'vencimiento', label: 'Vencimientos' },
            { valor: 'stock', label: 'Stock Bajo' }
          ].map(filtro => (
            <button
              key={filtro.valor}
              onClick={() => setFiltroTipo(filtro.valor)}
              className="px-4 py-2 rounded-lg font-medium transition"
              style={{
                background: filtroTipo === filtro.valor ? '#1A3A5C' : (darkMode ? '#2d3f60' : '#ffffff'),
                color: filtroTipo === filtro.valor ? '#ffffff' : (darkMode ? '#a0aec0' : '#6A9BB5'),
                border: `1px solid ${filtroTipo === filtro.valor ? '#1A3A5C' : (darkMode ? '#2d3f60' : '#E2F0F4')}`,
                cursor: 'pointer'
              }}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {/* Lista de alertas */}
        <div className="space-y-4">
          {alertasFiltradas.length > 0 ? (
            alertasFiltradas.map(alerta => (
              <div
                key={alerta.id}
                className="p-4 rounded-lg border transition"
                style={{
                  background: darkMode ? '#1a2332' : getSeveridadBg(alerta.severidad),
                  borderColor: darkMode ? '#2d3f60' : getSeveridadBorder(alerta.severidad)
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className="p-3 rounded-lg flex-shrink-0" style={{ background: getSeveridadColor(alerta.severidad) + '20' }}>
                    {alerta.tipo === 'vencimiento' ? (
                      <FiClock size={20} style={{ color: getSeveridadIconColor(alerta.severidad) }} />
                    ) : (
                      <FiPackage size={20} style={{ color: getSeveridadIconColor(alerta.severidad) }} />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold" style={{ color: darkMode ? '#ffffff' : '#1A3A5C' }}>
                          {alerta.producto}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: darkMode ? '#cbd5e1' : '#2d3f60' }}>
                          {alerta.detalles}
                        </p>
                        <p className="text-sm font-medium mt-2" style={{ color: getSeveridadIconColor(alerta.severidad) }}>
                          {alerta.mensaje}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: darkMode ? '#ffffff' : '#1A3A5C' }}>
                          {alerta.valor} {alerta.unidad}
                        </p>
                        {alerta.tipo === 'stock' && (
                          <p className="text-xs mt-1" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>
                            Mínimo: {alerta.stockMinimo}
                          </p>
                        )}
                        {alerta.tipo === 'vencimiento' && (
                          <p className="text-xs mt-1" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>
                            {alerta.fecha}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge de tipo */}
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{
                      background: alerta.tipo === 'vencimiento' 
                        ? (darkMode ? '#1a2332' : '#FFEDD5')
                        : (darkMode ? '#1a2332' : '#FEF3C7'),
                      color: alerta.tipo === 'vencimiento' 
                        ? (darkMode ? '#FB923C' : '#EA580C')
                        : (darkMode ? '#FBBF24' : '#D97706'),
                      border: `1px solid ${alerta.tipo === 'vencimiento' ? '#FBCF97' : '#FCD34D'}`
                    }}>
                      {alerta.tipo === 'vencimiento' ? 'Vencimiento' : 'Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-lg border" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#E2F0F4' }}>
              <FiCheckCircle className="mx-auto mb-3" size={48} style={{ color: '#10B981' }} />
              <p className="text-lg font-semibold" style={{ color: darkMode ? '#ffffff' : '#1A3A5C' }}>
                ¡Todo está en orden!
              </p>
              <p className="text-sm mt-2" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>
                No hay alertas activas en el sistema
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
