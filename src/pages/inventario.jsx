import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { supabase } from '../packages/supabase';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formProducto, setFormProducto] = useState({
    nombre: '',
    id_categoria: '',
    precio_venta: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: catData } = await supabase.from('categoria').select('id_categoria, nombre');
      setCategorias(catData || []);

      // FILTRO: Solo traer productos activos
      const { data: prodData, error: prodError } = await supabase
        .from('producto')
        .select('*')
        .eq('activo', true) // <-- Borrado lógico: solo activos
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      const productosConFormato = (prodData || []).map(prod => ({
        ...prod,
        nombre_categoria: catData?.find(c => c.id_categoria === prod.id_categoria)?.nombre || 'General'
      }));
      setProductos(productosConFormato);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // FUNCIÓN ACTUALIZADA: Borrado Lógico
  const handleDeleteLogical = async (id, nombre) => {
    if (window.confirm(`¿Deseas dar de baja el producto "${nombre}"? No aparecerá en el inventario activo.`)) {
      try {
        const { error } = await supabase
          .from('producto')
          .update({ activo: false }) // <-- Cambiamos el estado, no borramos la fila
          .eq('id_producto', id);

        if (error) throw error;
        fetchData(); // Refrescar tabla
      } catch (error) {
        alert('Error al dar de baja: ' + error.message);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formProducto.nombre,
        id_categoria: parseInt(formProducto.id_categoria),
        precio_venta: parseFloat(formProducto.precio_venta),
        stock_minimo: 5,
        activo: true // Aseguramos que nazca activo
      };

      if (editingId) {
        const { error } = await supabase.from('producto').update(payload).eq('id_producto', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('producto').insert([payload]);
        if (error) throw error;
      }
      
      closeModal();
      fetchData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEditClick = (producto) => {
    setEditingId(producto.id_producto);
    setFormProducto({
      nombre: producto.nombre,
      id_categoria: producto.id_categoria,
      precio_venta: producto.precio_venta,
      descripcion: producto.descripcion || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormProducto({ nombre: '', id_categoria: '', precio_venta: '', descripcion: '' });
  };

  const filteredProducts = productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500">Farmacia Villa Norte — Gestión de Existencias</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-cyan-700 transition-all font-semibold shadow-lg shadow-cyan-100"
        >
          <FiPlus className="mr-2" size={20} /> Agregar Producto
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" placeholder="Buscar medicamento..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Precio Venta</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10 text-gray-400">Consultando base de datos...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10 text-gray-400">No hay productos activos.</td></tr>
            ) : filteredProducts.map((prod) => (
              <tr key={prod.id_producto} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-700">{prod.nombre}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                    {prod.nombre_categoria}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-semibold">Q {Number(prod.precio_venta).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleEditClick(prod)}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16}/>
                    </button>
                    <button 
                      onClick={() => handleDeleteLogical(prod.id_producto, prod.nombre)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Dar de baja"
                    >
                      <FiTrash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - Se mantiene igual que la versión anterior pero con etiquetas de "Editar/Guardar" */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Editar Medicamento' : 'Nuevo Registro'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                <input 
                  type="text" required
                  className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg focus:border-cyan-500 outline-none"
                  value={formProducto.nombre}
                  onChange={e => setFormProducto({...formProducto, nombre: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Categoría</label>
                <select 
                  required className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg focus:border-cyan-500 outline-none bg-white"
                  value={formProducto.id_categoria}
                  onChange={e => setFormProducto({...formProducto, id_categoria: e.target.value})}
                >
                  <option value="">Selecciona...</option>
                  {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Precio de Venta (Q)</label>
                <input 
                  type="number" step="0.01" required
                  className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg focus:border-cyan-500 outline-none"
                  value={formProducto.precio_venta}
                  onChange={e => setFormProducto({...formProducto, precio_venta: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-400 font-semibold">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 shadow-md">
                  {editingId ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}