import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiAlertTriangle, FiBox } from 'react-icons/fi';
import { supabase } from '../packages/supabase';
import { invalidarAlertas } from '../utils/alertUtils';

export default function Inventario({ darkMode }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [vencimientos, setVencimientos] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formProducto, setFormProducto] = useState({
    nombre: '',
    id_categoria: '',
    precio_venta: '',
    stock_minimo: '10'
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: catData } = await supabase
        .schema('farmacia')
        .from('categoria')
        .select('id_categoria, nombre');
      setCategorias(catData || []);

      const { data: prodData, error } = await supabase
        .schema('farmacia')
        .from('vista_stock_actual')
        .select('*')
        .order('producto', { ascending: true });

      if (error) throw error;
      setProductos(prodData || []);

      const { data: lotesData } = await supabase
        .schema('farmacia')
        .from('lote')
        .select('id_producto, fecha_vencimiento')
        .eq('activo', true)
        .gt('cantidad_actual', 0)
        .order('fecha_vencimiento', { ascending: true });

      if (lotesData) {
        const map = {};
        lotesData.forEach(l => {
          if (!map[l.id_producto]) map[l.id_producto] = l.fecha_vencimiento;
        });
        setVencimientos(map);
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = productos.filter(p =>
    p.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formProducto.nombre,
        id_categoria: parseInt(formProducto.id_categoria) || null,
        precio_venta: parseFloat(formProducto.precio_venta),
        stock_minimo: parseInt(formProducto.stock_minimo) || 0,
        activo: true
      };

      const { error } = editingId
        ? await supabase.schema('farmacia').from('producto').update(payload).eq('id_producto', editingId)
        : await supabase.schema('farmacia').from('producto').insert([payload]);

      if (error) throw error;
      closeModal();
      invalidarAlertas();
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openEdit = (p) => {
    setEditingId(p.id_producto);
    setFormProducto({
      nombre: p.producto,
      id_categoria: p.id_categoria,
      precio_venta: p.precio_venta || '',
      stock_minimo: p.stock_minimo || 5
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormProducto({ nombre: '', id_categoria: '', precio_venta: '', stock_minimo: '10' });
  };

  const renderVencimiento = (idProducto) => {
    const fecha = vencimientos[idProducto];
    if (!fecha) return <span style={{ color: darkMode ? '#6A9BB5' : '#a8aec0' }}>—</span>;
    const dias = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
    const color = dias <= 30 ? '#ef4444' : dias <= 90 ? '#f97316' : (darkMode ? '#e0e0e0' : '#475569');
    const peso = dias <= 90 ? 700 : 400;
    return (
      <span style={{ color, fontWeight: peso }}>
        {new Date(fecha).toLocaleDateString('es-GT')} {dias <= 30 ? '⚠️' : ''}
      </span>
    );
  };

  return (
    <div className="p-4" style={{ background: darkMode ? '#1a1f2e' : '#f0f8fa' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a3a5c' }}>Inventario</h1>
          <p className="text-sm" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Control de existencias y niveles mínimos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          onMouseEnter={e => e.currentTarget.style.background = '#0e7490'}
          onMouseLeave={e => e.currentTarget.style.background = '#0891B2'}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 24px',
            borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            border: 'none', background: '#0891B2', color: 'white', fontFamily: 'inherit',
            boxShadow: '0 10px 15px rgba(6,182,212,.2)', transition: 'all .2s'
          }}>
          <FiPlus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="p-4 rounded-2xl shadow-sm border mb-6" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#e2eff4' }}>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: darkMode ? '#6A9BB5' : '#a8aec0' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            className="w-full pl-12 pr-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all"
            style={{ background: darkMode ? '#2d3f60' : '#f8fcfd', color: darkMode ? '#ffffff' : '#1a3a5c' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ background: darkMode ? '#1a2332' : '#ffffff', borderColor: darkMode ? '#2d3f60' : '#e2eff4' }}>
        <table className="w-full text-left">
          <thead style={{ background: darkMode ? '#2d3f60' : '#f8fcfd', borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#e2eff4'}` }}>
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Medicamento</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Categoría</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Precio</th>
              <th className="px-6 py-4 text-center text-[10px] uppercase font-bold tracking-widest" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Stock</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Próx. Vencimiento</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Estado</th>
              <th className="px-6 py-4 text-center text-[10px] uppercase font-bold tracking-widest" style={{ color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Acciones</th>
            </tr>
          </thead>
          <tbody style={{ borderTop: `1px solid ${darkMode ? '#2d3f60' : '#f8fcfd'}` }}>
            {loading ? (
              <tr><td colSpan="7" className="px-6 py-10 text-center animate-pulse" style={{ color: darkMode ? '#6A9BB5' : '#a8aec0' }}>Cargando inventario...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-10 text-center" style={{ color: darkMode ? '#6A9BB5' : '#a8aec0' }}>No se encontraron productos.</td></tr>
            ) : filteredProducts.map(p => (
              <tr key={p.id_producto} className="transition-colors" style={{ background: 'transparent', borderBottom: `1px solid ${darkMode ? '#2d3f60' : '#f0f8fa'}` }}>
                <td className="px-6 py-4 font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a3a5c' }}>{p.producto}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] px-2 py-1 rounded-md font-bold uppercase" style={{ background: darkMode ? '#1a3a5c' : '#ecf8fb', color: darkMode ? '#5BBFCC' : '#0891b2' }}>
                    {p.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold" style={{ color: darkMode ? '#ffffff' : '#1a3a5c' }}>
                  Q {parseFloat(p.precio_venta).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 font-bold" style={{ color: p.alerta_stock_bajo ? '#ef4444' : (darkMode ? '#e0e0e0' : '#475569') }}>
                    <FiBox size={16} />
                    {p.stock_actual}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {renderVencimiento(p.id_producto)}
                </td>
                <td className="px-6 py-4">
                  {p.alerta_stock_bajo ? (
                    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full w-fit" style={{ background: '#fef2f2', color: '#991B1B', border: '1px solid #fecaca' }}>
                      <FiAlertTriangle size={12} /> REABASTECER
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full w-fit" style={{ background: '#dcfce7', color: '#166534' }}>
                      STOCK OK
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg transition-all" style={{ color: '#0891b2' }}><FiEdit2 size={16} /></button>
                    <button className="p-2 rounded-lg transition-all" style={{ color: '#ef4444' }}><FiTrash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" style={{ background: darkMode ? '#1a2332' : '#ffffff' }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ background: darkMode ? '#2d3f60' : '#f8fcfd', borderColor: darkMode ? '#2d3f60' : '#f0f0f0' }}>
              <h2 className="text-xl font-bold" style={{ color: darkMode ? '#ffffff' : '#1a3a5c' }}>{editingId ? 'Editar Info' : 'Registrar'} Producto</h2>
              <button onClick={closeModal} style={{ color: darkMode ? '#a0aec0' : '#a8aec0' }}><FiX size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-tighter ml-1 block" style={{ color: darkMode ? '#a0aec0' : '#a8aec0' }}>Nombre del Medicamento</label>
                <input type="text" className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" style={{ background: darkMode ? '#2d3f60' : '#f8fcfd', borderColor: darkMode ? '#2d3f60' : '#e2eff4', color: darkMode ? '#ffffff' : '#1a3a5c' }} value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-tighter ml-1 block" style={{ color: darkMode ? '#a0aec0' : '#a8aec0' }}>Precio de Venta (Q)</label>
                  <input type="number" step="0.01" min="0" className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" style={{ background: darkMode ? '#2d3f60' : '#f8fcfd', borderColor: darkMode ? '#2d3f60' : '#e2eff4', color: darkMode ? '#ffffff' : '#1a3a5c' }} value={formProducto.precio_venta} onChange={e => setFormProducto({ ...formProducto, precio_venta: e.target.value })} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-red-400 uppercase tracking-tighter ml-1 block">Mínimo para Alerta</label>
                  <input type="number" className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991B1B' }} value={formProducto.stock_minimo} onChange={e => setFormProducto({ ...formProducto, stock_minimo: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-tighter ml-1 block" style={{ color: darkMode ? '#a0aec0' : '#a8aec0' }}>Categoría</label>
                <select className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" style={{ background: darkMode ? '#2d3f60' : '#f8fcfd', borderColor: darkMode ? '#2d3f60' : '#e2eff4', color: darkMode ? '#ffffff' : '#1a3a5c' }} value={formProducto.id_categoria} onChange={e => setFormProducto({ ...formProducto, id_categoria: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-2xl font-black shadow-lg shadow-cyan-100 transition-all uppercase tracking-widest text-xs">
                  {editingId ? 'Actualizar Producto' : 'Guardar en Inventario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}