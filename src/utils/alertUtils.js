// Utilidades para gestionar el estado de alertas

export const invalidarAlertas = () => {
  // Limpia la marca de "vistas" para que el badge vuelva a aparecer
  localStorage.removeItem('alertasVisadasAt')
}

export const verificarAlertas = () => {
  const alertasVisadasAt = localStorage.getItem('alertasVisadasAt')
  const tiempoAhora = new Date().getTime()
  const tiempoVisita = alertasVisadasAt ? parseInt(alertasVisadasAt) : 0
  
  // Si pasaron más de 5 segundos, considerar como nuevas
  return (tiempoAhora - tiempoVisita) > 5000
}

export const marcarAlertasVistas = () => {
  localStorage.setItem('alertasVisadasAt', new Date().getTime().toString())
}
