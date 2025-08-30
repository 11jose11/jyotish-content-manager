// Servicio para cargar datos del panchanga desde JSON
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
      const data = await loadJsonData<TithiData>('TIthi.json')
      tithiCache = data
    }

    const normalizedName = tithiName.toLowerCase().trim()
    
    // Buscar en devatas por tithi
    const devata = tithiCache.tithi.devatas_por_tithi.find(d => 
      d.tithi.toLowerCase().includes(normalizedName)
    )

    // Buscar en grupos nandadi
    const grupo = tithiCache.tithi.nandadi_sanjna.grupos.find(g => 
      g.categoria.toLowerCase().includes(normalizedName)
    )

    if (devata || grupo) {
      return {
        name: tithiName,
        nameIAST: tithiName,
        translation: tithiName,
        element: grupo?.elemento || 'Agua',
        deity: devata?.devata || 'Candra',
        recommendations: grupo ? 
          `${grupo.significado}. ${grupo.no_recomendado ? 'No recomendado para śubhakarmas.' : 'Favorable para actividades.'}` :
          'Tithi lunar tradicional'
      }
    }

    return null
  } catch (error) {
    console.error('Error getting tithi details:', error)
    return null
  }
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
      const data = await loadJsonData<YogaData>('nitya-yogas.json')
      yogaCache = data
    }

    const normalizedName = yogaName.toLowerCase().trim()
    
    const yoga = yogaCache.yogas.find(y => 
      y.nombre.toLowerCase().includes(normalizedName)
    )

    if (yoga) {
      return {
        name: yoga.nombre,
        nameIAST: yoga.nombre,
        translation: yoga.nombre,
        type: yoga.tipo,
        recommendations: `Favorables: ${yoga.favorables.join(', ')}. Desfavorables: ${yoga.desfavorables.join(', ')}`
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
