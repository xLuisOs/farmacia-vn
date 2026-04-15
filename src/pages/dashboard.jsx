import React, { useEffect, useState } from 'react'
import { 
  FiPackage, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiCalendar, 
  FiShoppingCart,
  FiArrowUpRight,
  FiArrowDownRight 
} from "react-icons/fi";
import { supabase } from '../packages/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    ventasDia: 0,
    ingresosDia: 0,
    bajoStock: 0,
    porVencer: 0
  })
  const [productosBajoStock, setProductosBajoStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      
      const hoy = new Date().toISOString().split('T')[0]
      const proximoMes = new Date()
      proximoMes.setDate(proximoMes.getDate() + 30)
      const fechaLimite = proximoMes.toISOString().split('T')[0]

      // 1. Consultar productos con bajo stock (ejemplo: menos de 10 unidades)
      const { data: stockData, count: bajoStockCount } = await supabase
        .from('producto')
        .select('nombre, stock_actual', { count: 'exact' })
        .lt('stock_actual', 10)
        .limit(5)

      // 2. Consultar productos por vencer en los próximos 30 días
      const { count: vencerCount } = await supabase
        .from('producto')
        .select('*', { count: 'exact', head: true })
        .lte('fecha_vencimiento', fechaLimite)
        .gte('fecha_vencimiento', hoy)

      // 3. Consultar ventas e ingresos del día (de la tabla venta)
      const { data: ventasData } = await supabase
        .from('venta')
        .select('total')
        .gte('fecha_venta', `${hoy}T00:00:00`)
        .lte('fecha_venta', `${hoy}T23:59:59`)

      const totalVentas = ventasData?.length || 0
      const totalIngresos = ventasData?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0

      setStats({
        ventasDia: totalVentas,
        ingresosDia: totalIngresos,
        bajoStock: bajoStockCount || 0,
        porVencer: vencerCount || 0
      })
      setProductosBajoStock(stockData || [])

    } catch (error) {
      console.error("Error cargando dashboard:", error.message)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, detail }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`text-2xl ${color.replace('bg-', 'text-')}`} />
        </div>
        {detail && (
          <span className="text-xs font-medium text-green-500 flex items-center bg-green-50 px-2 py-1 rounded-full">
            <FiArrowUpRight className="mr-1" /> {detail}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando datos del sistema...</div>
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Resumen operativo de Farmacia Villa Norte</p>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Ventas del día" 
          value={stats.ventasDia} 
          icon={FiShoppingCart} 
          color="bg-cyan-500"
          detail="Hoy"
        />
        <StatCard 
          title="Ingresos del día" 
          value={`Q ${stats.ingresosDia.toFixed(2)}`} 
          icon={FiTrendingUp} 
          color="bg-blue-600"
          detail="Hoy"
        />
        <StatCard 
          title="Productos stock bajo" 
          value={stats.bajoStock} 
          icon={FiAlertTriangle} 
          color="bg-orange-400"
        />
        <StatCard 
          title="Próximos a vencer" 
          value={stats.porVencer} 
          icon={FiCalendar} 
          color="bg-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla Simple de Estado */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FiPackage className="mr-2 text-cyan-600" /> Estado del Inventario Crítico
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-50">
                  <th className="pb-3 font-medium">PRODUCTO</th>
                  <th className="pb-3 font-medium">STOCK ACTUAL</th>
                  <th className="pb-3 font-medium">ESTADO</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {productosBajoStock.length > 0 ? productosBajoStock.map((prod, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 font-medium text-gray-700">{prod.nombre}</td>
                    <td className="py-4 text-gray-600">{prod.stock_actual} unid.</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs">Stock bajo</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-400">Todo el inventario está en niveles óptimos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas del Sistema */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Alertas del Sistema</h3>
          <div className="space-y-4">
            {stats.bajoStock > 0 && (
              <div className="flex items-start p-3 bg-orange-50 rounded-lg">
                <FiAlertTriangle className="text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Reabastecimiento necesario</p>
                  <p className="text-xs text-orange-600">Tienes {stats.bajoStock} productos con stock crítico.</p>
                </div>
              </div>
            )}
            {stats.porVencer > 0 && (
              <div className="flex items-start p-3 bg-red-50 rounded-lg">
                <FiCalendar className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Vencimiento próximo</p>
                  <p className="text-xs text-red-600">{stats.porVencer} productos vencen en menos de 30 días.</p>
                </div>
              </div>
            )}
            {stats.bajoStock === 0 && stats.porVencer === 0 && (
              <div className="text-center py-10">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiPackage className="text-green-600 text-xl" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No hay alertas activas</p>
                <p className="text-xs text-gray-400">El sistema está operando normalmente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}