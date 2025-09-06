// Servicio para cargar datos del panchanga desde la nueva API
interface NakshatraData {
  nombre: string
  favorables: string[]
  desfavorables: string[]
}

interface TithiData {
  tithi: {
    devatas_por_tithi: Array<{
      tithi: string
      devata: string
    }>
    nandadi_sanjna: {
      grupos: Array<{
        categoria: string
        tithis: number[]
        elemento: string
        significado: string
        no_recomendado: boolean
      }>
    }
  }
}

interface KaranaData {
  karana: {
    devatas: {
      carakaranas_BS_100_1_2: Record<string, string>
      sthirakaranas_sagrados_para: Record<string, string>
    }
    karanas_detalle: Array<{
      nombre: string
      categoria: string
      auspicioso_subhakarmas: boolean
      favorable: string
      desfavorable?: string
    }>
  }
}

interface VaraData {
  dias: Array<{
    orden: number
    vara: string
    es: string
    planeta: string
    tipo: string
    alias: string
    descripcion_corta: string
    consejo: string
    actividades_sugeridas: string[]
    lista_tradicional: string[]
  }>
}

interface YogaData {
  yogas: Array<{
    nombre: string
    tipo: string
    favorables: string[]
    desfavorables: string[]
  }>
}

interface SpecialYogaData {
  name: string
  name_sanskrit: string
  name_spanish: string
  polarity: string
  type: string
  description: string
  detailed_description: string
  beneficial_activities: string[]
  avoid_activities: string[]
  notes: string
}

// Cache para los datos JSON
let nakshatraCache: NakshatraData[] | null = null
let tithiCache: TithiData | null = null
let karanaCache: KaranaData | null = null
let varaCache: VaraData | null = null
let yogaCache: YogaData | null = null
let specialYogaCache: Record<string, SpecialYogaData> | null = null

// Función para cargar datos JSON
const loadJsonData = async <T>(filename: string): Promise<T> => {
  try {
    const response = await fetch(`/json-database/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading ${filename}:`, error)
    throw error
  }
}

// Función para obtener datos de nakshatra
export const getNakshatraDetails = async (nakshatraName: string): Promise<any> => {
  try {
    if (!nakshatraCache) {
      const data = await loadJsonData<{nakshatras: NakshatraData[]}>('Nakashatras.json')
      nakshatraCache = data.nakshatras
    }

    const normalizedName = nakshatraName.toLowerCase().trim()
    
    const nakshatra = nakshatraCache.find(n => 
      n.nombre.toLowerCase().includes(normalizedName) ||
             n.nombre.toLowerCase().replace(/[āīūṛṝḷḹṃḥ]/g, (match) => {
         const map: Record<string, string> = {
           'ā': 'a', 'ī': 'i', 'ū': 'u', 'ṛ': 'r', 'ṝ': 'r', 'ḷ': 'l', 'ḹ': 'l', 'ṃ': 'm', 'ḥ': 'h'
         }
         return map[match] || match
       }).includes(normalizedName)
    )

    if (nakshatra) {
      return {
        name: nakshatra.nombre,
        nameIAST: nakshatra.nombre,
        translation: nakshatra.nombre,
        deity: 'Luna',
        classification: 'Nakshatra',
        recommendations: `Favorables: ${nakshatra.favorables.join(', ')}. Desfavorables: ${nakshatra.desfavorables.join(', ')}`
      }
    }

    return null
  } catch (error) {
    console.error('Error getting nakshatra details:', error)
    return null
  }
}

// Función para obtener datos de tithi
export const getTithiDetails = async (tithiName: string): Promise<any> => {
  try {
    if (!tithiCache) {
      const data = await loadJsonData<any>('TIthi.json')
      tithiCache = data
    }

    // Buscar en la estructura correcta del archivo TIthi.json
    // El archivo tiene una estructura diferente, vamos a crear recomendaciones basadas en el tithi
    const tithiNumber = getTithiNumber(tithiName)
    
    if (tithiNumber) {
      const recommendations = getTithiRecommendationsByNumber(parseInt(tithiNumber))
      return {
        name: tithiName,
        nameIAST: tithiName,
        translation: getTithiTranslation(tithiName),
        element: 'Agua',
        deity: 'Candra',
        recommendations: recommendations
      }
    }

    return null
  } catch (error) {
    console.error('Error getting tithi details:', error)
    return null
  }
}

// Función auxiliar para obtener número del tithi
const getTithiNumber = (tithiName: string): string | null => {
  const tithiNumbers: Record<string, string> = {
    'Pratipada': '1', 'Dvitiya': '2', 'Tritiya': '3', 'Chaturthi': '4', 'Panchami': '5',
    'Shashthi': '6', 'Saptami': '7', 'Ashtami': '8', 'Navami': '9', 'Dashami': '10',
    'Ekadashi': '11', 'Dwadashi': '12', 'Trayodashi': '13', 'Chaturdashi': '14', 'Purnima': '15',
    'Amavasya': '15'
  }
  return tithiNumbers[tithiName] || null
}

// Función auxiliar para obtener traducción del tithi
const getTithiTranslation = (tithiName: string): string => {
  const translations: Record<string, string> = {
    'Pratipada': 'Primer día lunar',
    'Dvitiya': 'Segundo día lunar',
    'Tritiya': 'Tercer día lunar',
    'Chaturthi': 'Cuarto día lunar',
    'Panchami': 'Quinto día lunar',
    'Shashthi': 'Sexto día lunar',
    'Saptami': 'Séptimo día lunar',
    'Ashtami': 'Octavo día lunar',
    'Navami': 'Noveno día lunar',
    'Dashami': 'Décimo día lunar',
    'Ekadashi': 'Undécimo día lunar',
    'Dwadashi': 'Duodécimo día lunar',
    'Trayodashi': 'Decimotercer día lunar',
    'Chaturdashi': 'Decimocuarto día lunar',
    'Purnima': 'Luna llena',
    'Amavasya': 'Luna nueva'
  }
  return translations[tithiName] || 'Día lunar'
}

// Función auxiliar para obtener recomendaciones por número de tithi
const getTithiRecommendationsByNumber = (tithiNumber: number): string => {
  if (tithiNumber >= 1 && tithiNumber <= 5) {
    return 'Favorables: iniciar proyectos, comienzos, actividades creativas. Desfavorables: finalizar asuntos importantes.'
  } else if (tithiNumber >= 6 && tithiNumber <= 10) {
    return 'Favorables: actividades de crecimiento, desarrollo, expansión. Desfavorables: actividades destructivas.'
  } else if (tithiNumber >= 11 && tithiNumber <= 15) {
    return 'Favorables: actividades de culminación, finalización, celebración. Desfavorables: iniciar nuevos proyectos.'
  }
  return 'Favorables: actividades según la fase lunar. Desfavorables: actividades contrarias al período lunar.'
}

// Función para obtener datos de karana
export const getKaranaDetails = async (karanaName: string): Promise<any> => {
  try {
    if (!karanaCache) {
      const data = await loadJsonData<KaranaData>('karanas.json')
      karanaCache = data
    }

    const normalizedName = karanaName.toLowerCase().trim()
    
    const karana = karanaCache.karana.karanas_detalle.find(k => 
      k.nombre.toLowerCase().includes(normalizedName)
    )

    if (karana) {
      const devata = karanaCache.karana.devatas.carakaranas_BS_100_1_2[karana.nombre] || 
                     karanaCache.karana.devatas.sthirakaranas_sagrados_para[karana.nombre] || 
                     'Unknown'
      
      return {
        name: karana.nombre,
        nameIAST: karana.nombre,
        translation: karana.nombre,
        deity: devata,
        recommendations: `${karana.favorable}${karana.desfavorable ? `. Desfavorable: ${karana.desfavorable}` : ''}`
      }
    }

    return null
  } catch (error) {
    console.error('Error getting karana details:', error)
    return null
  }
}

// Función para obtener datos de vara
export const getVaraDetails = async (varaName: string): Promise<any> => {
  try {
    if (!varaCache) {
      const data = await loadJsonData<VaraData>('Vara.json')
      varaCache = data
    }

    const normalizedName = varaName.toLowerCase().trim()
    
    const vara = varaCache.dias.find(v => 
      v.vara.toLowerCase().includes(normalizedName) ||
      v.es.toLowerCase().includes(normalizedName)
    )

    if (vara) {
      return {
        name: vara.vara,
        nameIAST: vara.vara,
        translation: vara.es,
        planet: vara.planeta,
        recommendations: `${vara.descripcion_corta}. ${vara.consejo}. Actividades sugeridas: ${vara.actividades_sugeridas.join(', ')}`
      }
    }

    return null
  } catch (error) {
    console.error('Error getting vara details:', error)
    return null
  }
}

// Función para obtener datos de yoga
export const getYogaDetails = async (yogaName: string): Promise<any> => {
  try {
    if (!yogaCache) {
      const data = await loadJsonData<any>('nitya-yogas.json')
      yogaCache = data
    }

    const normalizedName = yogaName.toLowerCase().trim()
    
    // Buscar en la estructura correcta: data.yoga.tablas.base_27
    const yoga = (yogaCache as any)?.yoga?.tablas?.base_27?.find((y: any) => 
      y.nombre.toLowerCase().includes(normalizedName)
    )

    if (yoga) {
      return {
        name: yoga.nombre,
        nameIAST: yoga.nombre,
        translation: yoga.significado || yoga.nombre,
        type: 'Yoga solar-lunar',
        deity: yoga.deidad,
        recommendations: `Yoga auspicioso. Significado: ${yoga.significado}. Deidad: ${yoga.deidad}. Nakshatra asociado: ${yoga.nakshatra}.`
      }
    }

    return null
  } catch (error) {
    console.error('Error getting yoga details:', error)
    return null
  }
}

// Función para obtener datos de yogas especiales
export const getSpecialYogaDetails = async (yogaNames: string[]): Promise<SpecialYogaData[]> => {
  try {
    if (!specialYogaCache) {
      const data = await loadJsonData<{yogas: Record<string, SpecialYogaData>}>('yogas-special.json')
      specialYogaCache = data.yogas
    }

    const results: SpecialYogaData[] = []
    
    for (const yogaName of yogaNames) {
      const normalizedName = yogaName.toLowerCase().trim()
      
      for (const [key, yoga] of Object.entries(specialYogaCache)) {
        if (key.toLowerCase().includes(normalizedName) ||
            yoga.name.toLowerCase().includes(normalizedName) ||
            yoga.name_sanskrit.toLowerCase().includes(normalizedName)) {
          results.push(yoga)
          break
        }
      }
    }

    return results
  } catch (error) {
    console.error('Error getting special yoga details:', error)
    return []
  }
}

// Función para obtener datos de la nueva API
export const getPanchangaDataFromAPI = async () => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jyotish-api-ndcfqrjivq-uc.a.run.app'
    const response = await fetch(`${API_BASE_URL}/v1/panchanga/recommendations/panchanga/all`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching panchanga data from API:', error)
    throw error
  }
}

// Función para mapear nombres del frontend a nombres del backend
const mapPanchangaNames = (panchangaData: any) => {
  const varaMapping: { [key: string]: string } = {
    'Ravivara': 'Sunday',
    'Somavara': 'Monday', 
    'Mangalavara': 'Tuesday',
    'Budhavara': 'Wednesday',
    'Brihaspativara': 'Thursday',
    'Shukravara': 'Friday',
    'Shanivara': 'Saturday'
  }
  
  const tithiMapping: { [key: string]: string } = {
    'Pratipada': 'Pratipada',
    'Dwitiya': 'Dwitiya',
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
    'Amavasya': 'Amavasya'
  }
  
  const nakshatraMapping: { [key: string]: string } = {
    'Aśvinī': 'Aśvinī',
    'Bharaṇī': 'Bharaṇī',
    'Kṛttikā': 'Kṛttikā',
    'Rohiṇī': 'Rohiṇī',
    'Mṛgaśirā': 'Mṛgaśirā',
    'Ārdrā': 'Ārdrā',
    'Punarvasu': 'Punarvasu',
    'Puṣya': 'Puṣya',
    'Aśleṣā': 'Aśleṣā',
    'Maghā': 'Maghā',
    'Pūrvaphālgunī': 'Pūrvaphālgunī',
    'Uttaraphālgunī': 'Uttaraphālgunī',
    'Hastā': 'Hastā',
    'Citrā': 'Citrā',
    'Svāti': 'Svāti',
    'Viśākhā': 'Viśākhā',
    'Anurādhā': 'Anurādhā',
    'Jyeṣṭhā': 'Jyeṣṭhā',
    'Mūla': 'Mūla',
    'Pūrvāṣāḍhā': 'Pūrvāṣāḍhā',
    'Uttarāṣāḍhā': 'Uttarāṣāḍhā',
    'Śravaṇa': 'Śravaṇa',
    'Dhaniṣṭhā': 'Dhaniṣṭhā',
    'Śatabhiṣā': 'Śatabhiṣā',
    'Pūrvabhādrapadā': 'Pūrvabhādrapadā',
    'Uttarabhādrapadā': 'Uttarabhādrapadā',
    'Revatī': 'Revatī'
  }
  
  const yogaMapping: { [key: string]: string } = {
    'Vishkumbha': 'Viśkumbha',
    'Priti': 'Priti',
    'Ayushman': 'Āyuṣmān',
    'Saubhagya': 'Saubhāgya',
    'Shobhana': 'Śobhana',
    'Atiganda': 'Atigaṇḍa',
    'Sukarma': 'Sukarma',
    'Dhriti': 'Dhṛti',
    'Shula': 'Śūla',
    'Ganda': 'Gaṇḍa',
    'Vriddhi': 'Vṛddhi',
    'Dhruva': 'Dhruva',
    'Vyaghata': 'Vyāghāta',
    'Harshana': 'Harṣaṇa',
    'Vajra': 'Vajra',
    'Siddhi': 'Siddhi',
    'Vyatipata': 'Vyatīpāta',
    'Variyan': 'Variyān',
    'Parigha': 'Parigha',
    'Shiva': 'Śiva',
    'Siddha': 'Siddha',
    'Sadhya': 'Sādhya',
    'Shubha': 'Śubha',
    'Shukla': 'Śukla',
    'Brahma': 'Brahmā',
    'Indra': 'Indra',
    'Vaidhriti': 'Vaidhṛti'
  }
  
  return {
    vara: panchangaData.vara ? varaMapping[panchangaData.vara] || panchangaData.vara : undefined,
    tithi: panchangaData.tithi ? tithiMapping[panchangaData.tithi] || panchangaData.tithi : undefined,
    nakshatra: panchangaData.nakshatra ? nakshatraMapping[panchangaData.nakshatra] || panchangaData.nakshatra : undefined,
    yoga: panchangaData.yoga ? yogaMapping[panchangaData.yoga] || panchangaData.yoga : undefined
  }
}

// Función para obtener recomendaciones diarias de la API
export const getDailyRecommendationsFromAPI = async (date: string, latitude: number, longitude: number, panchangaData?: any) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jyotish-api-ndcfqrjivq-uc.a.run.app'
    
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams({
      date,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    })
    
    // Agregar parámetros del panchanga si están disponibles
    if (panchangaData) {
      const mappedData = mapPanchangaNames(panchangaData)
      console.log('🔄 Original panchanga data:', panchangaData)
      console.log('🔄 Mapped panchanga data:', mappedData)
      
      if (mappedData.vara) queryParams.append('vara', mappedData.vara)
      if (mappedData.tithi) queryParams.append('tithi', mappedData.tithi)
      if (mappedData.nakshatra) queryParams.append('nakshatra', mappedData.nakshatra)
      if (mappedData.yoga) queryParams.append('nitya_yoga', mappedData.yoga)
    }
    
    console.log('🔗 API URL:', `${API_BASE_URL}/v1/panchanga/recommendations/daily?${queryParams}`)
    
    const response = await fetch(`${API_BASE_URL}/v1/panchanga/recommendations/daily?${queryParams}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('📊 API Response:', data)
    return data
  } catch (error) {
    console.error('Error fetching daily recommendations from API:', error)
    throw error
  }
}

// Función principal para obtener todos los detalles del panchanga
export const getPanchangaDetails = async (panchangaData: any) => {
  try {
    const [
      nakshatraDetails,
      tithiDetails,
      karanaDetails,
      varaDetails,
      yogaDetails,
      specialYogaDetails
    ] = await Promise.all([
      getNakshatraDetails(panchangaData.nakshatra?.name || ''),
      getTithiDetails(panchangaData.tithi?.name || ''),
      getKaranaDetails(panchangaData.karana?.name || ''),
      getVaraDetails(panchangaData.vara?.name || ''),
      getYogaDetails(panchangaData.yoga?.name || ''),
      getSpecialYogaDetails(panchangaData.specialYogas?.map((y: any) => y.name) || [])
    ])

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
