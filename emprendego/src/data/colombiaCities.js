/**
 * Lista oficial de ciudades/municipios de Colombia
 * Organizada alfabéticamente
 * Incluye capitales departamentales y municipios principales
 */

export const CO_CITIES = [
  // A
  "Acacías",
  "Aguachica",
  "Apartadó",
  "Arauca",
  "Armenia",
  "Baranoa",
  "Barranquilla",
  "Bello",
  "Bogotá",
  "Bucaramanga",
  "Buenaventura",
  "Buga",
  // C
  "Cali",
  "Calarcá",
  "Cartagena",
  "Cartago",
  "Caucasia",
  "Cereté",
  "Chía",
  "Chinchiná",
  "Chiquinquirá",
  "Ciénaga",
  "Cimitarra",
  "Cota",
  "Cúcuta",
  // D
  "Dosquebradas",
  "Duitama",
  // E
  "El Carmen de Viboral",
  "Envigado",
  "Espinal",
  // F
  "Facatativá",
  "Florencia",
  "Floridablanca",
  "Funza",
  "Fusagasugá",
  // G
  "Galapa",
  "Garzón",
  "Girardot",
  "Girón",
  "Granada",
  "Guadalajara de Buga",
  // I
  "Ibagué",
  "Ipiales",
  "Itagüí",
  // J
  "Jamundí",
  // L
  "La Ceja",
  "La Dorada",
  "La Estrella",
  "La Plata",
  "La Unión",
  "Leticia",
  "Lorica",
  // M
  "Madrid",
  "Magangué",
  "Maicao",
  "Malambo",
  "Manizales",
  "Marinilla",
  "Medellín",
  "Melgar",
  "Mocoa",
  "Montelíbano",
  "Montería",
  "Mosquera",
  // N
  "Neiva",
  // O
  "Ocaña",
  // P
  "Palmira",
  "Pamplona",
  "Pasto",
  "Pereira",
  "Piedecuesta",
  "Pitalito",
  "Popayán",
  "Puerto Asís",
  "Puerto Berrío",
  "Puerto Boyacá",
  "Puerto Carreño",
  "Puerto Colombia",
  // Q
  "Quibdó",
  // R
  "Riohacha",
  "Rionegro",
  "Riosucio",
  // S
  "Sabanalarga",
  "Sabaneta",
  "Sahagún",
  "San Andrés",
  "San Gil",
  "San José del Guaviare",
  "San Juan de Pasto",
  "San Marcos",
  "Santa Marta",
  "Santa Rosa de Cabal",
  "Santander de Quilichao",
  "Sincelejo",
  "Soacha",
  "Socorro",
  "Sogamoso",
  "Soledad",
  // T
  "Tame",
  "Tierralta",
  "Tocancipá",
  "Tuluá",
  "Tumaco",
  "Tunja",
  "Turbaco",
  "Turbo",
  // U
  "Ubaté",
  "Uribia",
  // V
  "Valledupar",
  "Vélez",
  "Villa del Rosario",
  "Villamaría",
  "Villavicencio",
  // Y
  "Yarumal",
  "Yopal",
  "Yumbo",
  // Z
  "Zaragoza",
  "Zipaquirá",
].sort((a, b) => a.localeCompare(b, 'es'))

/**
 * Normaliza texto para comparaciones (quita acentos y pasa a minúsculas)
 * @param {string} text - Texto a normalizar
 * @returns {string} - Texto normalizado
 */
export const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Busca ciudades que coincidan con el término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} limit - Máximo de resultados (default: 10)
 * @returns {string[]} - Lista de ciudades que coinciden
 */
export const searchCities = (searchTerm, limit = 10) => {
  if (!searchTerm || searchTerm.trim().length < 1) {
    return CO_CITIES.slice(0, limit)
  }
  
  const normalizedSearch = normalizeText(searchTerm.trim())
  
  return CO_CITIES
    .filter(city => normalizeText(city).includes(normalizedSearch))
    .slice(0, limit)
}

/**
 * Verifica si una ciudad existe en la lista (comparación normalizada)
 * @param {string} cityName - Nombre de la ciudad
 * @returns {string|null} - Nombre oficial si existe, null si no
 */
export const findOfficialCity = (cityName) => {
  if (!cityName) return null
  
  const normalizedInput = normalizeText(cityName.trim())
  
  return CO_CITIES.find(city => normalizeText(city) === normalizedInput) || null
}
