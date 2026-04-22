import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiAlertTriangle, FiBox } from 'react-icons/fi';
import { supabase } from '../packages/supabase';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formProducto, setFormProducto] = useState({
    nombre: '',
    id_categoria: '',
    precio_venta: '',
    stock: '0',
    stock_minimo: '10'
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: catData } = await supabase.from('categoria').select('id_categoria, nombre');
      setCategorias(catData || []);

      const { data: prodData, error } = await supabase
        .from('producto')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;

      setProductos(prodData.map(p => ({
        ...p,
        nombre_categoria: catData?.find(c => c.id_categoria === p.id_categoria)?.nombre || 'Sin categoría'
      })));
    } catch (err) {
      console.error("Error al cargar inventario:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // Lógica de filtrado
  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formProducto.nombre,
        id_categoria: parseInt(formProducto.id_categoria),
        precio_venta: parseFloat(formProducto.precio_venta),
        stock: parseInt(formProducto.stock),
        stock_minimo: parseInt(formProducto.stock_minimo),
        activo: true
      };

      const { error } = editingId 
        ? await supabase.from('producto').update(payload).eq('id_producto', editingId)
        : await supabase.from('producto').insert([payload]);

      if (error) throw error;
      
      closeModal();
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openEdit = (p) => {
    setEditingId(p.id_producto);
    setFormProducto({ 
      nombre: p.nombre, 
      id_categoria: p.id_categoria, 
      precio_venta: p.precio_venta,
      stock: p.stock,
      stock_minimo: p.stock_minimo || 5
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormProducto({ nombre: '', id_categoria: '', precio_venta: '', stock: '0', stock_minimo: '10' });
  };

  return (
    <div className="p-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500 text-sm">Control de existencias y niveles mínimos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl flex items-center shadow-lg transition-all font-bold text-sm">
          <FiPlus className="mr-2" size={18}/> NUEVO PRODUCTO
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA RECUPERADA */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm text-slate-700 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Medicamento</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 animate-pulse">Cargando inventario...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">No se encontraron productos.</td></tr>
            ) : filteredProducts.map(p => {
              const alerta = p.stock <= p.stock_minimo;
              return (
                <tr key={p.id_producto} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{p.nombre}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-1 rounded-md font-bold uppercase">
                      {p.nombre_categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center justify-center gap-2 font-bold ${alerta ? 'text-red-500' : 'text-slate-600'}`}>
                      <FiBox size={16}/>
                      {p.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {alerta ? (
                      <span className="flex items-center gap-1 text-red-600 text-[10px] font-black bg-red-50 border border-red-100 px-2 py-1 rounded-full w-fit">
                        <FiAlertTriangle size={12}/> REABASTECER
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-full w-fit">
                        STOCK OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 hover:bg-cyan-50 text-cyan-600 rounded-lg transition-all"><FiEdit2 size={16}/></button>
                      <button className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-all"><FiTrash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal permanece igual... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Info' : 'Registrar'} Producto</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Nombre del Medicamento</label>
                <input type="text" className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" value={formProducto.nombre} onChange={e => setFormProducto({...formProducto, nombre: e.target.value})} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Stock Actual</label>
                  <input type="number" className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" value={formProducto.stock} onChange={e => setFormProducto({...formProducto, stock: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-red-400 uppercase tracking-tighter ml-1">Mínimo para Alerta</label>
                  <input type="number" className="w-full mt-1 p-3 bg-red-50/30 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-red-600" value={formProducto.stock_minimo} onChange={e => setFormProducto({...formProducto, stock_minimo: e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Categoría</label>
                <select className="w-full mt-1 p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" value={formProducto.id_categoria} onChange={e => setFormProducto({...formProducto, id_categoria: e.target.value})} required>
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