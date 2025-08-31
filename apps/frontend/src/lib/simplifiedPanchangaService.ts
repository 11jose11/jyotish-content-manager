// Servicio simplificado para datos del panchanga usando archivo unificado
interface PanchangaElement {
  name: string
  nameIAST: string
  translation: string
  deity?: string
  planet?: string
  element?: string
  type?: string
  classification?: string
  recommendations: string
}

interface SpecialYogaElement {
  name: string
  nameIAST?: string
  translation?: string
  polarity?: string
  type?: string
  description?: string
  detailed_description?: string
  beneficial_activities?: string[]
  avoid_activities?: string[]
}

interface SimplifiedPanchangaData {
  nakshatras: any[]
  tithis: any[]
  karanas: any[]
  varas: any[]
  yogas: any[]
  specialYogas: any[]
}

class SimplifiedPanchangaService {
  private data: SimplifiedPanchangaData | null = null
  private isLoading = false
  private loadPromise: Promise<void> | null = null

  // Mapeo de nombres del API a nombres en nuestro JSON
  private nameMappings = {
    nakshatras: {
      'Ashwini': 'Aśvinī',
      'Bharani': 'Bharaṇī',
      'Krittika': 'Kṛttikā',
      'Rohini': 'Rohiṇī',
      'Mrigashira': 'Mṛgaśirā',
      'Ardra': 'Ārdrā',
      'Punarvasu': 'Punarvasu',
      'Pushya': 'Puṣya',
      'Aslesha': 'Āśleṣā',
      'Magha': 'Maghā',
      'Purva Phalguni': 'Pūrva Phālgunī',
      'Uttara Phalguni': 'Uttara Phālgunī',
      'Hasta': 'Hasta',
      'Chitra': 'Citrā',
      'Swati': 'Svātī',
      'Vishakha': 'Viśākhā',
      'Anuradha': 'Anurādhā',
      'Jyeshtha': 'Jyeṣṭhā',
      'Mula': 'Mūla',
      'Purva Ashadha': 'Pūrva Āṣāḍhā',
      'Uttara Ashadha': 'Uttara Āṣāḍhā',
      'Shravana': 'Śravaṇa',
      'Dhanishta': 'Dhaniṣṭhā',
      'Shatabhisha': 'Śatabhiṣā',
      'Purva Bhadrapada': 'Pūrva Bhādrapadā',
      'Uttara Bhadrapada': 'Uttara Bhādrapadā',
      'Revati': 'Revatī',
      // Variaciones adicionales
      'Ashwini Nakshatra': 'Aśvinī',
      'Bharani Nakshatra': 'Bharaṇī',
      'Krittika Nakshatra': 'Kṛttikā',
      'Rohini Nakshatra': 'Rohiṇī',
      'Mrigashira Nakshatra': 'Mṛgaśirā',
      'Ardra Nakshatra': 'Ārdrā',
      'Punarvasu Nakshatra': 'Punarvasu',
      'Pushya Nakshatra': 'Puṣya',
      'Aslesha Nakshatra': 'Āśleṣā',
      'Magha Nakshatra': 'Maghā',
      'Purva Phalguni Nakshatra': 'Pūrva Phālgunī',
      'Uttara Phalguni Nakshatra': 'Uttara Phālgunī',
      'Hasta Nakshatra': 'Hasta',
      'Chitra Nakshatra': 'Citrā',
      'Swati Nakshatra': 'Svātī',
      'Vishakha Nakshatra': 'Viśākhā',
      'Anuradha Nakshatra': 'Anurādhā',
      'Jyeshtha Nakshatra': 'Jyeṣṭhā',
      'Mula Nakshatra': 'Mūla',
      'Purva Ashadha Nakshatra': 'Pūrva Āṣāḍhā',
      'Uttara Ashadha Nakshatra': 'Uttara Āṣāḍhā',
      'Shravana Nakshatra': 'Śravaṇa',
      'Dhanishta Nakshatra': 'Dhaniṣṭhā',
      'Shatabhisha Nakshatra': 'Śatabhiṣā',
      'Purva Bhadrapada Nakshatra': 'Pūrva Bhādrapadā',
      'Uttara Bhadrapada Nakshatra': 'Uttara Bhādrapadā',
      'Revati Nakshatra': 'Revatī'
    },
    tithis: {
      'Pratipada': 'Pratipada',
      'Dwitiya': 'Dvitiya',
      'Tritiya': 'Tritiya',
      'Chaturthi': 'Chaturthi',
      'Panchami': 'Panchami',
      'Shashthi': 'Shashthi',
      'Saptami': 'Saptami',
      'Ashtami': 'Ashtami',
      'Navami': 'Navami',
      'Dashami': 'Dashami',
      'Ekadashi': 'Ekadashi',
      'Dwadashi': 'Dwadashi',
      'Trayodashi': 'Trayodashi',
      'Chaturdashi': 'Chaturdashi',
      'Purnima': 'Purnima',
      'Amavasya': 'Amavasya',
      // Variaciones adicionales
      'Pratipada Tithi': 'Pratipada',
      'Dwitiya Tithi': 'Dvitiya',
      'Tritiya Tithi': 'Tritiya',
      'Chaturthi Tithi': 'Chaturthi',
      'Panchami Tithi': 'Panchami',
      'Shashthi Tithi': 'Shashthi',
      'Saptami Tithi': 'Saptami',
      'Ashtami Tithi': 'Ashtami',
      'Navami Tithi': 'Navami',
      'Dashami Tithi': 'Dashami',
      'Ekadashi Tithi': 'Ekadashi',
      'Dwadashi Tithi': 'Dwadashi',
      'Trayodashi Tithi': 'Trayodashi',
      'Chaturdashi Tithi': 'Chaturdashi',
      'Purnima Tithi': 'Purnima',
      'Amavasya Tithi': 'Amavasya',
      // Números
      '1': 'Pratipada',
      '2': 'Dvitiya',
      '3': 'Tritiya',
      '4': 'Chaturthi',
      '5': 'Panchami',
      '6': 'Shashthi',
      '7': 'Saptami',
      '8': 'Ashtami',
      '9': 'Navami',
      '10': 'Dashami',
      '11': 'Ekadashi',
      '12': 'Dwadashi',
      '13': 'Trayodashi',
      '14': 'Chaturdashi',
      '15': 'Purnima',
      '30': 'Amavasya'
    },
    karanas: {
      'Bava': 'Bava',
      'Balava': 'Balava',
      'Kaulava': 'Kaulava',
      'Taitila': 'Taitila',
      'Garija': 'Gara',
      'Gara': 'Gara',
      'Vanija': 'Vanija',
      'Vishti': 'Vishti',
      'Shakuni': 'Shakuni',
      'Chatushpada': 'Chatushpada',
      'Naga': 'Naga',
      'Kimstughna': 'Kimstughna',
      // Variaciones adicionales
      'Bava Karana': 'Bava',
      'Balava Karana': 'Balava',
      'Kaulava Karana': 'Kaulava',
      'Taitila Karana': 'Taitila',
      'Garija Karana': 'Gara',
      'Gara Karana': 'Gara',
      'Vanija Karana': 'Vanija',
      'Vishti Karana': 'Vishti',
      'Shakuni Karana': 'Shakuni',
      'Chatushpada Karana': 'Chatushpada',
      'Naga Karana': 'Naga',
      'Kimstughna Karana': 'Kimstughna'
    },
    varas: {
      'Sunday': 'Ravivara',
      'Monday': 'Somavara',
      'Tuesday': 'Mangalavara',
      'Wednesday': 'Budhavara',
      'Thursday': 'Guruvara',
      'Friday': 'Shukravara',
      'Saturday': 'Shanivara',
      'Ravivara': 'Ravivara',
      'Somavara': 'Somavara',
      'Mangalavara': 'Mangalavara',
      'Budhavara': 'Budhavara',
      'Guruvara': 'Guruvara',
      'Shukravara': 'Shukravara',
      'Shanivara': 'Shanivara',
      // Variaciones adicionales
      'Domingo': 'Ravivara',
      'Lunes': 'Somavara',
      'Martes': 'Mangalavara',
      'Miércoles': 'Budhavara',
      'Jueves': 'Guruvara',
      'Viernes': 'Shukravara',
      'Sábado': 'Shanivara',
      'Sun': 'Ravivara',
      'Mon': 'Somavara',
      'Tue': 'Mangalavara',
      'Wed': 'Budhavara',
      'Thu': 'Guruvara',
      'Fri': 'Shukravara',
      'Sat': 'Shanivara'
    },
    yogas: {
      'Vishkumbha': 'Vishkumbha',
      'Priti': 'Priti',
      'Ayushman': 'Ayushman',
      'Saubhagya': 'Saubhagya',
      'Shobhana': 'Shobhana',
      'Atiganda': 'Atiganda',
      'Sukarman': 'Sukarman',
      'Dhriti': 'Dhriti',
      'Shula': 'Shula',
      'Ganda': 'Ganda',
      'Vriddhi': 'Vriddhi',
      'Dhruva': 'Dhruva',
      'Vyaghata': 'Vyaghata',
      'Harshana': 'Harshana',
      'Vajra': 'Vajra',
      'Siddhi': 'Siddhi',
      'Vyatipata': 'Vyatipata',
      'Variyan': 'Variyan',
      'Parigha': 'Parigha',
      'Shiva': 'Shiva',
      'Siddha': 'Siddha',
      'Sadhya': 'Sadhya',
      'Shubha': 'Shubha',
      'Shukla': 'Shukla',
      'Brahma': 'Brahma',
      'Indra': 'Indra',
      'Vaidhriti': 'Vaidhriti'
    }
  }

  // Cargar datos una sola vez
  private async loadData(): Promise<void> {
    if (this.data) return // Ya cargado
    if (this.isLoading) {
      // Si ya se está cargando, esperar
      await this.loadPromise
      return
    }

    this.isLoading = true
    this.loadPromise = this.performLoad()
    
    try {
      await this.loadPromise
    } finally {
      this.isLoading = false
      this.loadPromise = null
    }
  }

  private async performLoad(): Promise<void> {
    try {
      console.log('📂 Loading simplified panchanga data...')
      const response = await fetch('/panchanga-simplified.json')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      this.data = await response.json()
      console.log('✅ Simplified panchanga data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading simplified panchanga data:', error)
      console.log('🔄 Using hardcoded fallback data...')
      
      // Fallback con datos hardcodeados
      this.data = {
        nakshatras: [
          {
            name: "Aśvinī",
            nameIAST: "Aśvinī",
            translation: "Los Jinetes Celestiales",
            deity: "Aśvins",
            classification: "Tikṣṇa (Afilado)",
            element: "Tierra",
            planet: "Ketu",
            favorables: [
              "inicios/proyectos",
              "aprender habilidades",
              "tratamientos, salud, rejuvenecimiento",
              "acciones rápidas",
              "ecuestre, viajes, compra/venta",
              "reparar vehículos",
              "joyas/ropa nueva",
              "ocultismo/leyes",
              "sthāpana (instalar ídolo)",
              "agricultura",
              "excavar estanques/pozos",
              "manejo de venenos",
              "uso de armas",
              "cambio de nombre"
            ],
            desfavorables: [
              "matrimonio",
              "cerrar/proyectos finales",
              "tareas que requieren paciencia",
              "exceso emocional/sexual",
              "intoxicación"
            ]
          },
          {
            name: "Bharaṇī",
            nameIAST: "Bharaṇī",
            translation: "La Portadora",
            deity: "Yama",
            classification: "Ugra (Feroz)",
            element: "Tierra",
            planet: "Venus",
            favorables: [
              "creatividad marciana (severo/competitivo)",
              "sexo/amor/procreación",
              "rituales de fertilidad/agricultura",
              "fuego",
              "retomar pendientes",
              "ascetismo/ayuno/purificación",
              "trato con niños"
            ],
            desfavorables: [
              "viajes (embotellamientos/accidentes)",
              "iniciaciones",
              "nuevos comienzos (mejor cerrar)"
            ]
          },
          {
            name: "Kṛttikā",
            nameIAST: "Kṛttikā",
            translation: "Las Pléyades",
            deity: "Agni",
            classification: "Mṛdu (Suave)",
            element: "Fuego",
            planet: "Sol",
            favorables: [
              "adoración del fuego/purificación",
              "decisiones ejecutivas",
              "cocina/bordado/costura",
              "aseo (afeitado/corte)",
              "honestidad/franqueza",
              "debatir/discusión",
              "tambores/actividades extra"
            ],
            desfavorables: [
              "diplomacia/redes sociales",
              "relajación/descanso",
              "actividades acuáticas"
            ]
          }
        ],
        tithis: [
          {
            name: "Pratipada",
            nameIAST: "Pratipadā",
            translation: "Primer día lunar",
            deity: "Brahmā",
            element: "Agua",
            classification: "Nandā",
            favorables: [
              "inicios de proyectos",
              "nuevos comienzos",
              "actividades creativas",
              "planificación"
            ],
            desfavorables: [
              "actividades destructivas",
              "finales de ciclos"
            ]
          },
          {
            name: "Dvitiya",
            nameIAST: "Dvitīyā",
            translation: "Segundo día lunar",
            deity: "Vidhātā",
            element: "Tierra",
            classification: "Bhadrā",
            favorables: [
              "actividades estables",
              "construcción",
              "trabajos de larga duración",
              "fundamentos"
            ],
            desfavorables: [
              "actividades inestables",
              "cambios repentinos"
            ]
          }
        ],
        karanas: [
          {
            name: "Bava",
            nameIAST: "Bava",
            translation: "Nacimiento",
            deity: "Indra",
            planet: "Sol",
            classification: "Móvil",
            favorables: [
              "salud y confort",
              "autocuidado",
              "terapias",
              "mejoras de entorno"
            ],
            desfavorables: [
              "actividades destructivas"
            ]
          },
          {
            name: "Balava",
            nameIAST: "Bālava",
            translation: "Fuerza",
            deity: "Brahmā",
            planet: "Luna",
            classification: "Móvil",
            favorables: [
              "actividades creativas",
              "estudio",
              "meditación"
            ],
            desfavorables: [
              "actividades destructivas"
            ]
          }
        ],
        varas: [
          {
            name: "Ravivara",
            nameIAST: "Ravivāra",
            translation: "Domingo",
            planet: "Sol",
            classification: "Dhruva (Fijo)",
            favorables: [
              "inaugurar negocios o cargos",
              "poner cimientos",
              "trabajos con metales nobles",
              "ceremonias y hitos",
              "arte y oficios con fuego",
              "salud con terapias tradicionales",
              "actividades en naturaleza"
            ],
            desfavorables: [
              "actividades destructivas",
              "conflictos"
            ]
          },
          {
            name: "Somavara",
            nameIAST: "Somavāra",
            translation: "Lunes",
            planet: "Luna",
            classification: "Cara (Movible)",
            favorables: [
              "viajes, mudanzas",
              "adquirir vehículos",
              "jardinería y riego",
              "trabajo con agua",
              "joyería y plata",
              "manejo cuidadoso de animales"
            ],
            desfavorables: [
              "actividades fijas",
              "estabilidad excesiva"
            ]
          }
        ],
        yogas: [
          {
            name: "Vishkumbha",
            nameIAST: "Viśkumbha",
            translation: "Pilar",
            deity: "Ganesha",
            planet: "Venus",
            classification: "Auspicioso",
            favorables: [
              "construcción",
              "fundamentos",
              "actividades estables"
            ],
            desfavorables: [
              "actividades inestables"
            ]
          },
          {
            name: "Priti",
            nameIAST: "Prīti",
            translation: "Amor",
            deity: "Lakshmi",
            planet: "Mercurio",
            classification: "Auspicioso",
            favorables: [
              "romance",
              "amistad",
              "actividades sociales",
              "celebración"
            ],
            desfavorables: [
              "conflictos",
              "separaciones"
            ]
          }
        ],
        specialYogas: [
          {
            name: "Amrita Siddhi",
            nameIAST: "Amṛta Siddhi",
            translation: "Éxito del Néctar",
            polarity: "positive",
            type: "vara+nakshatra",
            description: "Yoga auspicioso para todas las actividades",
            detailed_description: "Uno de los yogas más auspiciosos. Ideal para iniciar nuevos proyectos, matrimonios, y actividades espirituales.",
            beneficial_activities: [
              "Iniciar nuevos proyectos",
              "Matrimonios",
              "Actividades espirituales",
              "Firma de contratos",
              "Inauguraciones"
            ],
            avoid_activities: []
          },
          {
            name: "Sarvartha Siddhi",
            nameIAST: "Sarvārtha Siddhi",
            translation: "Éxito en Todos los Propósitos",
            polarity: "positive",
            type: "vara+nakshatra",
            description: "Yoga auspicioso para todos los propósitos",
            detailed_description: "Excelente para cualquier actividad importante. Garantiza éxito en todos los esfuerzos.",
            beneficial_activities: [
              "Cualquier actividad importante",
              "Negocios",
              "Educación",
              "Viajes",
              "Ceremonias"
            ],
            avoid_activities: []
          }
        ]
      }
      
      console.log('✅ Fallback panchanga data loaded successfully')
    }
  }

  // Buscar elemento por nombre (búsqueda flexible con mapeo)
  private findElement(array: any[], searchName: string, category: 'nakshatras' | 'tithis' | 'karanas' | 'varas' | 'yogas'): any | null {
    if (!array || !searchName) {
      console.log(`🔍 Search failed: array=${!!array}, searchName=${searchName}`)
      return null
    }
    
    const normalizedSearch = searchName.toLowerCase().trim()
    console.log(`🔍 Searching for: "${normalizedSearch}" in array with ${array.length} items`)
    
    // Normalizar nombres (remover diacríticos, espacios extra, etc.)
    const normalizeName = (name: string) => {
      return name.toLowerCase()
        .replace(/[āáà]/g, 'a')
        .replace(/[īíì]/g, 'i')
        .replace(/[ūúù]/g, 'u')
        .replace(/[ṛṝ]/g, 'r')
        .replace(/[ḷḹ]/g, 'l')
        .replace(/[ṅ]/g, 'n')
        .replace(/[ñ]/g, 'n')
        .replace(/[ś]/g, 's')
        .replace(/[ṣ]/g, 's')
        .replace(/[ṭ]/g, 't')
        .replace(/[ḍ]/g, 'd')
        .replace(/[ṇ]/g, 'n')
        .replace(/[ṃ]/g, 'm')
        .replace(/[ḥ]/g, 'h')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    const normalizedSearchClean = normalizeName(normalizedSearch)
    
    // 1. Búsqueda por mapeo directo
    const mapping = this.nameMappings[category]
    if (mapping && (mapping as any)[searchName]) {
      const mappedName = (mapping as any)[searchName]
      console.log(`🗺️ Using mapping: "${searchName}" -> "${mappedName}"`)
      
      const element = array.find(item => 
        item.name === mappedName || item.nameIAST === mappedName
      )
      
      if (element) {
        console.log(`✅ Found via mapping: ${element.name}`)
        return element
      }
    }
    
    // 2. Búsqueda exacta normalizada
    let element = array.find(item => {
      const itemName = normalizeName(item.name || '')
      const itemNameIAST = normalizeName(item.nameIAST || '')
      return itemName === normalizedSearchClean || itemNameIAST === normalizedSearchClean
    })
    
    if (element) {
      console.log(`✅ Found exact match: ${element.name}`)
      return element
    }
    
    // 3. Búsqueda parcial más inteligente
    element = array.find(item => {
      const itemName = normalizeName(item.name || '')
      const itemNameIAST = normalizeName(item.nameIAST || '')
      const itemTranslation = normalizeName(item.translation || '')
      
      // Buscar en nombre, IAST y traducción
      return itemName.includes(normalizedSearchClean) || 
             itemNameIAST.includes(normalizedSearchClean) ||
             itemTranslation.includes(normalizedSearchClean) ||
             normalizedSearchClean.includes(itemName) || 
             normalizedSearchClean.includes(itemNameIAST) ||
             normalizedSearchClean.includes(itemTranslation)
    })
    
    if (element) {
      console.log(`✅ Found partial match: ${element.name}`)
      return element
    }
    
    // 4. Búsqueda por mapeo inverso (buscar en todos los mapeos)
    for (const [apiName, jsonName] of Object.entries(mapping || {})) {
      if (normalizeName(apiName) === normalizedSearchClean) {
        const mappedElement = array.find(item => 
          item.name === jsonName || item.nameIAST === jsonName
        )
        if (mappedElement) {
          console.log(`✅ Found via reverse mapping: "${apiName}" -> "${jsonName}"`)
          return mappedElement
        }
      }
    }
    
    // 5. Búsqueda por similitud (último recurso)
    let bestMatch = null
    let bestScore = 0
    
    for (const item of array) {
      const itemName = normalizeName(item.name || '')
      const itemNameIAST = normalizeName(item.nameIAST || '')
      const itemTranslation = normalizeName(item.translation || '')
      
      // Calcular similitud
      const nameScore = this.calculateSimilarity(normalizedSearchClean, itemName)
      const iastScore = this.calculateSimilarity(normalizedSearchClean, itemNameIAST)
      const translationScore = this.calculateSimilarity(normalizedSearchClean, itemTranslation)
      
      const maxScore = Math.max(nameScore, iastScore, translationScore)
      
      if (maxScore > bestScore && maxScore > 0.6) { // Umbral de similitud
        bestScore = maxScore
        bestMatch = item
      }
    }
    
    if (bestMatch) {
      console.log(`✅ Found via similarity (${bestScore.toFixed(2)}): ${bestMatch.name}`)
      return bestMatch
    }
    
    console.log(`❌ No match found for: "${normalizedSearch}" (normalized: "${normalizedSearchClean}")`)
    console.log(`📋 Available items:`, array.map(item => `${item.name || item.nameIAST} (${normalizeName(item.name || item.nameIAST)})`))
    console.log(`🗺️ Available mappings:`, Object.keys(mapping || {}))
    return null
  }

  // Calcular similitud entre dos strings
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0
    if (str1.length === 0 || str2.length === 0) return 0.0
    
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Distancia de Levenshtein para calcular similitud
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Buscar nakshatra
  async findNakshatra(searchName: string): Promise<PanchangaElement | null> {
    console.log(`🌙 Searching for nakshatra: "${searchName}"`)
    await this.loadData()
    
    if (!this.data?.nakshatras) {
      console.log('❌ No nakshatras data available')
      return null
    }
    
    const nakshatra = this.findElement(this.data.nakshatras, searchName, 'nakshatras')
    
    if (nakshatra) {
      return {
        name: nakshatra.name,
        nameIAST: nakshatra.nameIAST,
        translation: nakshatra.translation,
        deity: nakshatra.deity,
        classification: nakshatra.classification,
        element: nakshatra.element,
        planet: nakshatra.planet,
        recommendations: `Favorables: ${nakshatra.favorables?.join(', ') || 'No disponible'}. Desfavorables: ${nakshatra.desfavorables?.join(', ') || 'No disponible'}`
      }
    }
    
    return null
  }

  // Buscar tithi
  async findTithi(searchName: string): Promise<PanchangaElement | null> {
    console.log(`🌙 Searching for tithi: "${searchName}"`)
    await this.loadData()
    
    if (!this.data?.tithis) {
      console.log('❌ No tithis data available')
      return null
    }
    
    const tithi = this.findElement(this.data.tithis, searchName, 'tithis')
    
    if (tithi) {
      return {
        name: tithi.name,
        nameIAST: tithi.nameIAST,
        translation: tithi.translation,
        deity: tithi.deity,
        element: tithi.element,
        classification: tithi.classification,
        recommendations: `Favorables: ${tithi.favorables?.join(', ') || 'No disponible'}. Desfavorables: ${tithi.desfavorables?.join(', ') || 'No disponible'}`
      }
    }
    
    return null
  }

  // Buscar karana
  async findKarana(searchName: string): Promise<PanchangaElement | null> {
    await this.loadData()
    
    if (!this.data?.karanas) return null
    
    const karana = this.findElement(this.data.karanas, searchName, 'karanas')
    
    if (karana) {
      return {
        name: karana.name,
        nameIAST: karana.nameIAST,
        translation: karana.translation,
        deity: karana.deity,
        planet: karana.planet,
        classification: karana.classification,
        recommendations: `Favorables: ${karana.favorables?.join(', ') || 'No disponible'}. Desfavorables: ${karana.desfavorables?.join(', ') || 'No disponible'}`
      }
    }
    
    return null
  }

  // Buscar vara
  async findVara(searchName: string): Promise<PanchangaElement | null> {
    await this.loadData()
    
    if (!this.data?.varas) return null
    
    const vara = this.findElement(this.data.varas, searchName, 'varas')
    
    if (vara) {
      return {
        name: vara.name,
        nameIAST: vara.nameIAST,
        translation: vara.translation,
        planet: vara.planet,
        classification: vara.classification,
        recommendations: `Favorables: ${vara.favorables?.join(', ') || 'No disponible'}. Desfavorables: ${vara.desfavorables?.join(', ') || 'No disponible'}`
      }
    }
    
    return null
  }

  // Buscar yoga
  async findYoga(searchName: string): Promise<PanchangaElement | null> {
    await this.loadData()
    
    if (!this.data?.yogas) return null
    
    const yoga = this.findElement(this.data.yogas, searchName, 'yogas')
    
    if (yoga) {
      return {
        name: yoga.name,
        nameIAST: yoga.nameIAST,
        translation: yoga.translation,
        deity: yoga.deity,
        planet: yoga.planet,
        classification: yoga.classification,
        recommendations: `Favorables: ${yoga.favorables?.join(', ') || 'No disponible'}. Desfavorables: ${yoga.desfavorables?.join(', ') || 'No disponible'}`
      }
    }
    
    return null
  }

  // Buscar yogas especiales
  async findSpecialYogas(searchNames: string[]): Promise<SpecialYogaElement[]> {
    await this.loadData()
    
    if (!this.data?.specialYogas || !searchNames.length) return []
    
    const results: SpecialYogaElement[] = []
    
    for (const searchName of searchNames) {
      const yoga = this.findElement(this.data.specialYogas, searchName, 'yogas')
      
      if (yoga) {
        results.push({
          name: yoga.name,
          nameIAST: yoga.nameIAST,
          translation: yoga.translation,
          polarity: yoga.polarity,
          type: yoga.type,
          description: yoga.description,
          detailed_description: yoga.detailed_description,
          beneficial_activities: yoga.beneficial_activities,
          avoid_activities: yoga.avoid_activities
        })
      }
    }
    
    return results
  }

  // Función principal para obtener todos los detalles
  async getPanchangaDetails(panchangaData: any): Promise<any> {
    try {
      console.log('🚀 Loading panchanga details with simplified service...')
      console.log('📊 Input panchanga data:', panchangaData)
      
      // Extraer nombres exactos del API
      const nakshatraName = panchangaData.nakshatra?.name || ''
      const tithiName = panchangaData.tithi?.name || ''
      const karanaName = panchangaData.karana?.name || ''
      const varaName = panchangaData.vara?.name || ''
      const yogaName = panchangaData.yoga?.name || ''
      const specialYogaNames = panchangaData.specialYogas?.map((y: any) => y.name) || []
      
      console.log('🔍 Searching for elements:')
      console.log('  Nakshatra:', nakshatraName)
      console.log('  Tithi:', tithiName)
      console.log('  Karana:', karanaName)
      console.log('  Vara:', varaName)
      console.log('  Yoga:', yogaName)
      console.log('  Special Yogas:', specialYogaNames)
      
      const [
        nakshatraDetails,
        tithiDetails,
        karanaDetails,
        varaDetails,
        yogaDetails,
        specialYogaDetails
      ] = await Promise.all([
        this.findNakshatra(nakshatraName),
        this.findTithi(tithiName),
        this.findKarana(karanaName),
        this.findVara(varaName),
        this.findYoga(yogaName),
        this.findSpecialYogas(specialYogaNames)
      ])

      console.log('✅ Panchanga details loaded successfully')
      
      return {
        nakshatra: nakshatraDetails,
        tithi: tithiDetails,
        karana: karanaDetails,
        vara: varaDetails,
        yoga: yogaDetails,
        specialYogas: specialYogaDetails
      }
    } catch (error) {
      console.error('Error getting panchanga details:', error)
      return {
        nakshatra: null,
        tithi: null,
        karana: null,
        vara: null,
        yoga: null,
        specialYogas: []
      }
    }
  }

  // Verificar si los datos están cargados
  isDataLoaded(): boolean {
    return this.data !== null
  }

  // Obtener estadísticas
  getStats(): { loaded: boolean; isLoading: boolean; dataKeys: string[] } {
    return {
      loaded: this.data !== null,
      isLoading: this.isLoading,
      dataKeys: this.data ? Object.keys(this.data) : []
    }
  }
}

// Exportar instancia singleton
export const simplifiedPanchangaService = new SimplifiedPanchangaService()
