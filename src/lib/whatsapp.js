/**
 * Genera un enlace wa.me para contactar al anunciante.
 * Añade automáticamente el código de país +57 (Colombia)
 * si el número no lo incluye.
 */
export function buildWhatsAppUrl(phone, listingTitle = '', sourceName = '') {
  // Limpiar el número — solo dígitos
  const digits = phone.replace(/\D/g, '')

  // Añadir código de país +57 si no lo tiene
  const normalized = digits.startsWith('57') ? digits : `57${digits}`

  let message = ''
  if (sourceName && sourceName.toLowerCase() !== 'habitapp' && sourceName.toLowerCase() !== 'direct') {
    message = `Hola! Vi tu publicación "${listingTitle}" (publicada en ${sourceName}) que encontré en HabitApp (HabitApp.co). Me gustaría recibir más información sobre el arriendo.`
  } else if (listingTitle) {
    message = `Hola! Vi tu publicación "${listingTitle}" que encontré en HabitApp (HabitApp.co). Me gustaría recibir más información sobre el arriendo.`
  } else {
    message = `Hola! Vi tu publicación de arriendo que encontré en HabitApp (HabitApp.co). Me gustaría recibir más información.`
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

/**
 * Formatea un número de teléfono colombiano para mostrar
 * Ejemplo: 3001234567 → 300 123 4567
 */
export function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '').replace(/^57/, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone
}
