import { supabase } from '../packages/supabase'
import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'

const BTN = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none' }
const INPUT = { padding: '7px 10px', borderRadius: 7, border: '1.5px solid #E2F0F4', fontSize: 11, color: '#1A3A5C', background: 'white', width: '100%', fontFamily: 'inherit' }

function Modal({ user, onClose, onSaved }) {
  const empty = { nombre_completo: '', nombre_usuario: '', rol: 'cajero', activo: true, password_hash: '' }
  const [form, setForm] = useState(user || empty)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

const guardar = async () => {
    try {
      let datosAEnviar = { ...form };
      
      // Si estamos editando y no escribimos nada en contraseña, la quitamos del envío
      if (user && !datosAEnviar.password_hash) delete datosAEnviar.password_hash;

      let error;
      if (user) {
        // ACTUALIZAR (UPDATE)
        const { error: err } = await supabase
          .from('usuario')
          .update(datosAEnviar)
          .eq('id_usuario', user.id_usuario);
        error = err;
      } else {
        // INSERTAR NUEVO (INSERT)
        const { error: err } = await supabase
          .from('usuario')
          .insert([datosAEnviar]);
        error = err;
      }

      if (error) throw error;
      alert("¡Usuario guardado con éxito! ✨");
      onClose();
      if (onSaved) onSaved();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'white', borderRadius: 16, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ background: 'linear-gradient(90deg,#1A3A5C,#2A5278)', padding: '16px 20px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>{user ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>NOMBRE COMPLETO</label>
            <input value={form.nombre_completo} onChange={e => set('nombre_completo', e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>NOMBRE DE USUARIO</label>
            <input value={form.nombre_usuario} onChange={e => set('nombre_usuario', e.target.value)} style={INPUT} />
          </div>
          {!user && (
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 4 }}>CONTRASEÑA</label>
              <input type="password" placeholder="••••••••" style={INPUT} onChange={e => set('password_hash', e.target.value)}/>
            </div>
          )}
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5', display: 'block', marginBottom: 6 }}>ROL</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['administrador', 'cajero'].map(r => (
                <button key={r} onClick={() => set('rol', r)} style={{ padding: '6px 20px', borderRadius: 7, border: `1.5px solid ${form.rol === r ? '#1A3A5C' : '#E2F0F4'}`, background: form.rol === r ? '#1A3A5C' : 'white', color: form.rol === r ? 'white' : '#6A9BB5', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{r}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textTransform: 'capitalize'}}>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#6A9BB5' }}>ESTADO</label>
            <button onClick={() => set('activo', !form.activo)} style={{ padding: '5px 12px', borderRadius: 7, border: `1.5px solid ${form.activo ? '#3DBD8A' : '#E05C6A'}`, background: form.activo ? '#DCFCE7' : '#FEE2E2', color: form.activo ? '#166534' : '#991B1B', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {form.activo ? '✅ Activo' : '❌ Inactivo'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #E2F0F4' }}>
            <button onClick={onClose} style={{ ...BTN, background: 'white', color: '#1A3A5C', border: '1.5px solid #E2F0F4', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={guardar} style={{ ...BTN, background: '#1A3A5C', color: 'white', fontFamily: 'inherit' }}>💾 Guardar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Usuarios({ darkMode }) {
  const [usuarios, setUsuarios] = useState([])
  const [modal, setModal] = useState(false)
  const [editUser, setEditUser] = useState(null)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    const { data, error } = await supabase
      .schema('farmacia')
      .from('usuario')
      .select('*')
      .order('id_usuario', { ascending: true })
    
    if (error) console.error("Error cargando usuarios:", error.message)
    else setUsuarios(data)
  }

  return (
    <div style={{ padding: 16 }}>
      {modal && <Modal user={editUser} onClose={() => { setModal(false); setEditUser(null) }} onSaved={fetchUsuarios} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#ffffff' : '#1A3A5C' }}>Usuarios</div>
          <div style={{ fontSize: 14, color: darkMode ? '#a0aec0' : '#6A9BB5' }}>Gestión de accesos al sistema</div>
        </div>
        <button onClick={() => { setEditUser(null); setModal(true) }} onMouseEnter={e => e.currentTarget.style.background = '#0e7490'} onMouseLeave={e => e.currentTarget.style.background = '#0891B2'}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 24px',
          borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          border: 'none', background: '#0891B2', color: 'white', fontFamily: 'inherit',
          boxShadow: '0 10px 15px rgba(6,182,212,.2)', transition: 'all .2s'
          }}>
            <FiPlus size={16} /> Nuevo Usuario
        </button>
      </div>

      {/* Cards de usuarios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 30}}>
        {usuarios.map(u => {
          const initials = u.nombre_completo ? u.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('') : '??'
          return (
            <div key={u.id_usuario} style={{ background: 'white', borderRadius: 12, border: '1.5px solid #E2F0F4', padding: 16, boxShadow: '0 2px 8px rgba(11,31,75,.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#5BBFCC,#3A6E9E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1A3A5C' }}>{u.nombre_completo}</div>
                    <div style={{ fontSize: 14, color: '#6A9BB5' }}>@{u.nombre_usuario}</div>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: u.activo ? '#DCFCE7' : '#FEE2E2', color: u.activo ? '#166534' : '#991B1B' }}>{u.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: u.rol === 'administrador' ? '#1A3A5C' : '#DFF4F7', color: u.rol === 'administrador' ? 'white' : '#3A6E9E', textTransform: 'capitalize' }}>{u.rol}</span>
                <button onClick={() => { setEditUser(u); setModal(true) }} style={{ background: '#EEF1FA', border: 'none', color: '#2A5278', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}> Editar</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}