/**
 * Parsea un texto libre para extraer filtros de búsqueda (Ciudad, Tipo, Habitaciones)
 * @param {string} query - El texto introducido por el usuario (ej: "casa en armenia de 2 habitaciones")
 * @param {string[]} availableCities - Lista dinámica de ciudades registradas
 * @returns {object} { city, type, bedrooms }
 */
export function parseSmartQuery(query, availableCities = []) {
  const result = {
    city: '',
    type: '',
    bedrooms: ''
  }

  if (!query || typeof query !== 'string') return result

  const lowerQuery = query.toLowerCase()

  // 1. Detectar Ciudad (Buscamos la ciudad más larga primero por seguridad)
  const sortedCities = [...availableCities].sort((a, b) => b.length - a.length)
  for (const city of sortedCities) {
    // Escapar caracteres especiales y permitir prefijos como "en "
    const cityEscaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const cityRegex = new RegExp(`(?:^|\\s|,|en)\\s*(${cityEscaped.toLowerCase()})(?:$|\\s|,|\\.)`, 'i')
    if (cityRegex.test(lowerQuery)) {
      result.city = city
      break
    }
  }

  // 2. Detectar Tipo de Inmueble
  const typePatterns = {
    'apartment': /(apartamento|apto|depa)/i,
    'house': /(casa|cabaña|chalet|finca|villa)/i,
    'room': /(habitaci[oó]n|pieza|cuarto)/i,
    'commercial': /(local|oficina|bodega|comercial)/i,
    'land': /(lote|terreno)/i
  }

  for (const [typeValue, regex] of Object.entries(typePatterns)) {
    if (regex.test(lowerQuery)) {
      result.type = typeValue
      break
    }
  }

  // 3. Detectar Cantidad de Habitaciones (Ej: "2 habs", "dos cuartos", "3 alcobas")
  const numberMap = { 'un': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6 }
  const bedRegex = /(?:(\d+)|(un|una|dos|tres|cuatro|cinco|seis))\s*(?:hab|habitaci[oó]n|habitaciones|alcoba|alcobas|pieza|piezas|cuarto|cuartos)/i
  const bedMatch = lowerQuery.match(bedRegex)
  
  if (bedMatch) {
    if (bedMatch[1]) {
      result.bedrooms = bedMatch[1] // Dígito (ej: "2")
    } else if (bedMatch[2]) {
      result.bedrooms = numberMap[bedMatch[2].toLowerCase()].toString() // Palabra (ej: "dos")
    }
  }

  return result
}
