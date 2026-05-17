import { useState } from 'react'
import { supabase } from '../packages/supabase'
import { FiUser, FiLock, FiMoon, FiSun, FiCheck, FiAlertCircle } from 'react-icons/fi'

function getInputStyles(darkMode) {
  return {
    padding: '8px 10px', borderRadius: 7, border: `1.5px solid ${darkMode ? '#3f4d5f' : '#E2F0F4'}`,
    fontSize: 11, color: darkMode ? '#ffffff' : '#1A3A5C', background: darkMode ? '#1f2937' : 'white',
    width: '100%', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
  }
}

function getLabelStyles(darkMode) {
  return {
    fontSize: 10, fontWeight: 700, color: darkMode ? '#a0aec0' : '#6A9BB5',
    display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5
  }
}

function getBtnPrimaryStyles() {
  return {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
    borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
    border: 'none', background: '#1A3A5C', color: 'white', fontFamily: 'inherit'
  }
}

function Alerta({ tipo, mensaje, darkMode }) {
  const ok = tipo === 'exito'
  return (
    <div style={{ background: ok ? '#DCFCE7' : '#FEF2F2', border: `1px solid ${ok ? '#86EFAC' : '#FECACA'}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, color: ok ? '#166534' : '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
      {ok ? <FiCheck size={13} /> : <FiAlertCircle size={13} />}
      {mensaje}
    </div>
  )
}

export default function Configuracion({ user, setUser, darkMode, setDarkMode }) {
  const [passNueva, setPassNueva] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [alertaPass, setAlertaPass] = useState(null)

  // Colores dinámicos
  const colors = {
    bgPrimary: darkMode ? '#2d3748' : 'white',
    bgSecondary: darkMode ? '#1a1f2e' : '#F0F8FA',
    textPrimary: darkMode ? '#ffffff' : '#1A3A5C',
    textSecondary: darkMode ? '#a0aec0' : '#6A9BB5',
    border: darkMode ? '#3f4d5f' : '#E2F0F4',
    inputBg: darkMode ? '#1f2937' : 'white',
    inputText: darkMode ? '#ffffff' : '#1A3A5C',
  }

// Reemplazá la función cambiarPassword y los campos del formulario

const cambiarPassword = async () => {
  setAlertaPass(null)

  if (!passNueva || !passConfirm) {
    setAlertaPass({ tipo: 'error', mensaje: 'Completa todos los campos.' })
    return
  }
  if (passNueva.length < 6) {
    setAlertaPass({ tipo: 'error', mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.' })
    return
  }
  if (passNueva !== passConfirm) {
    setAlertaPass({ tipo: 'error', mensaje: 'Las contraseñas nuevas no coinciden.' })
    return
  }

  setGuardandoPass(true)
  try {
    const { error } = await supabase
      .from('usuario')
      .update({ password_hash: passNueva })
      .eq('id_usuario', user.id_usuario)

    if (error) throw error

    setUser(prev => ({ ...prev, password_hash: passNueva }))
    setPassNueva('')
    setPassConfirm('')
    setAlertaPass({ tipo: 'exito', mensaje: '¡Contraseña actualizada correctamente!' })
  } catch (err) {
    setAlertaPass({ tipo: 'error', mensaje: err.message })
  } finally {
    setGuardandoPass(false)
  }
}

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode', JSON.stringify(!darkMode))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary }}>Configuración</div>
        <div style={{ fontSize: 14, color: colors.textSecondary }}>Preferencias de tu cuenta</div>
      </div>

      {/* Info del usuario */}
      <div style={{ background: colors.bgPrimary, borderRadius: 12, border: `1.5px solid ${colors.border}`, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#2BC5D4,#1a7fc1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0 }}>
          {user?.nombre_completo?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>{user?.nombre_completo || '—'}</div>
          <div style={{ fontSize: 11, color: colors.textSecondary }}>@{user?.nombre_usuario}</div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: user?.rol === 'administrador' ? '#1A3A5C' : (darkMode ? '#3f4d5f' : '#E2F0F4'), color: user?.rol === 'administrador' ? 'white' : (darkMode ? '#a0aec0' : '#6A9BB5'), textTransform: 'capitalize', marginTop: 4, display: 'inline-block' }}>
            {user?.rol}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Cambiar contraseña */}
        <div style={{ background: colors.bgPrimary, borderRadius: 12, border: `1.5px solid ${colors.border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiLock size={15} color={colors.textPrimary} />
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>Cambiar contraseña</div>
          </div>
          <div>
            <label style={getLabelStyles(darkMode)}>Nueva contraseña</label>
            <input type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} style={getInputStyles(darkMode)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label style={getLabelStyles(darkMode)}>Confirmar nueva contraseña</label>
            <input type="password" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} style={getInputStyles(darkMode)} placeholder="Repetí la nueva contraseña" />
          </div>
          {alertaPass && <Alerta tipo={alertaPass.tipo} mensaje={alertaPass.mensaje} darkMode={darkMode} />}
          <button onClick={cambiarPassword} disabled={guardandoPass} style={{ ...getBtnPrimaryStyles(), justifyContent: 'center', opacity: guardandoPass ? .6 : 1 }}>
            {guardandoPass ? 'Guardando...' : <><FiLock size={12} /> Actualizar contraseña</>}
          </button>
        </div>

        {/* Apariencia */}
        <div style={{ background: colors.bgPrimary, borderRadius: 12, border: `1.5px solid ${colors.border}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiUser size={15} color={colors.textPrimary} />
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>Apariencia</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${colors.border}`, background: darkMode ? '#3f4d5f' : '#F8FCFD' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {darkMode ? <FiMoon size={16} color={colors.textSecondary} /> : <FiSun size={16} color="#F59E0B" />}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>{darkMode ? 'Modo oscuro' : 'Modo claro'}</div>
                <div style={{ fontSize: 10, color: colors.textSecondary }}>{darkMode ? 'Interfaz oscura activa' : 'Interfaz clara activa'}</div>
              </div>
            </div>
            <div
              onClick={handleToggleDarkMode}
              style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background .2s', flexShrink: 0, background: darkMode ? '#1A3A5C' : '#E2F0F4', position: 'relative' }}
            >
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, transition: 'left .2s', left: darkMode ? 23 : 3, boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}