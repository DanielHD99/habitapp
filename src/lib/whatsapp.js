/**
 * Genera un enlace wa.me para contactar al anunciante.
 * Añade automáticamente el código de país +57 (Colombia)
 * si el número no lo incluye.
 */
export function buildWhatsAppUrl(phone, listingTitle = '') {
  // Limpiar el número — solo dígitos
  const digits = phone.replace(/\D/g, '')

  // Añadir código de país +57 si no lo tiene
  const normalized = digits.startsWith('57') ? digits : `57${digits}`

  const message = listingTitle
    ? `Hola, estoy interesado en la vivienda "${listingTitle}" que tienes publicada en HabitApp.`
    : 'Hola, estoy interesado en la vivienda que tienes publicada en HabitApp.'

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
