/**
 * Formatea precio en pesos colombianos (COP)
 * Ejemplo: 850000 → "$850.000"
 */
export function formatPrice(amount) {
  if (!amount && amount !== 0) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea fecha relativa
 * Ejemplo: "hace 3 días"
 */
export function formatRelativeDate(dateStr) {
  const date = new Date(dateStr)
  const now  = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60)    return 'hace unos segundos'
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} minuto${Math.floor(diff / 60) !== 1 ? 's' : ''}`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) !== 1 ? 's' : ''}`
  if (diff < 2592000) return `hace ${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) !== 1 ? 's' : ''}`
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Trunca texto con puntos suspensivos
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

/**
 * Obtiene iniciales del nombre (para avatar)
 * Ejemplo: "Juan Pérez" → "JP"
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/**
 * Etiqueta legible del tipo de vivienda
 */
export const PROPERTY_TYPE_LABELS = {
  apartamento: 'Apartamento',
  casa:        'Casa',
  habitacion:  'Habitación',
}



/**
 * Etiqueta legible del estado
 */
export const STATUS_LABELS = {
  draft:      'Borrador',
  published:  'Publicada',
  hidden:     'Oculta',
  suspended:  'Suspendida',
  deleted:    'Eliminada',
}

export const STATUS_BADGE_CLASS = {
  draft:     'badge-neutral',
  published: 'badge-success',
  hidden:    'badge-warning',
  suspended: 'badge-danger',
  deleted:   'badge-danger',
}

/**
 * Motivos de reporte
 */
export const REPORT_REASONS = [
  { value: 'informacion_falsa',    label: 'Información falsa' },
  { value: 'vivienda_inexistente', label: 'Vivienda inexistente' },
  { value: 'contenido_inapropiado',label: 'Contenido inapropiado' },
  { value: 'posible_estafa',       label: 'Posible estafa' },
  { value: 'otro',                 label: 'Otro' },
]

/**
 * Ciudades habilitadas en la plataforma
 */
export const DEFAULT_CITY = 'Armenia'

/**
 * Roles del sistema
 */
export const ROLE_LABELS = {
  user:        'Usuario estándar',
  city_admin:  'Admin de Ciudad',
  super_admin: 'Super Admin (Global)',
  admin:       'Super Admin (Global)',
}


/**
 * Normaliza una dirección para comparación anti-duplicados
 */
export function normalizeAddress(address) {
  if (!address) return ''
  return address
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(carrera|crr|cra|cr)\b/g, 'cra')
    .replace(/\b(calle|cll|cl)\b/g, 'cll')
    .replace(/\b(avenida|avda|av)\b/g, 'av')
    .replace(/\b(numero|num|nro|n°|#)\b/g, '#')
    .replace(/[^a-z0-9#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}


