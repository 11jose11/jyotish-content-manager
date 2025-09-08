// Servicio para cargar datos del archivo panchanga-simplified.json
import { findBestMatch, getMappedName } from './nameMatching'

export interface NakshatraData {
  name: string
  nameIAST: string
  translation: string
  deity: string
  classification: string
  element: string
  planet: string
  favorables: string[]
  desfavorables: string[]
}

export interface TithiData {
  name: string
  nameIAST: string
  translation: string
  deity: string
  element: string
  classification: string
  categoryDescription?: string
  astrologicalInfluence?: string
  recommendation?: string
  favorables: string[]
  desfavorables: string[]
}

export interface VaraData {
  name: string
  nameIAST: string
  translation: string
  planet: string
  classification: string
  favorables: string[]
  desfavorables: string[]
}

export interface KaranaData {
  name: string
  nameIAST: string
  translation: string
  deity: string
  planet: string
  classification: string
  mount?: string
  description?: string
  recommendation?: string
  favorables: string[]
  desfavorables: string[]
}

export interface YogaData {
  name: string
  nameIAST: string
  translation: string
  deity: string
  planet: string
  classification: string
  explanation?: string
  favorables: string[]
  desfavorables: string[]
  detailed_description?: string
  color?: string
  priority?: number
  icon?: string
  category?: string
  beneficial_activities?: string[]
  avoid_activities?: string[]
  notes?: string
}

export interface SpecialYogaData {
  name: string
  nameIAST: string
  type: string
  polarity: 'positive' | 'negative' | 'neutral'
  priority: number
  color: string
  description: string
  detailedDescription: string
  favorables: string[]
  desfavorables: string[]
  recommendation: string
}

export interface PanchangaSimplifiedData {
  metadata: {
    version: string
    description: string
    created: string
    structure: string
  }
  nakshatras: NakshatraData[]
  tithis: TithiData[]
  varas: VaraData[]
  yogas: YogaData[]
  karanas: KaranaData[]
  specialYogas: SpecialYogaData[]
}

class PanchangaSimplifiedService {
  private data: PanchangaSimplifiedData | null = null
  private loadingPromise: Promise<PanchangaSimplifiedData> | null = null

  constructor() {
    this.loadData()
  }

  private async loadData(): Promise<PanchangaSimplifiedData> {
    if (this.data) {
      return this.data
    }

    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = this.fetchData()
    this.data = await this.loadingPromise
    return this.data
  }

  private async fetchData(): Promise<PanchangaSimplifiedData> {
    try {
      const response = await fetch('/json-database/panchanga-simplified.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('✅ Panchanga data loaded successfully:', data)
      return data as PanchangaSimplifiedData
    } catch (error) {
      console.error('Error loading panchanga simplified data:', error)
      // Retornar datos vacíos en caso de error
      return {
        metadata: { version: '1.0', description: 'Error loading data', created: new Date().toISOString(), structure: 'error' },
        nakshatras: [],
        tithis: [],
        varas: [],
        yogas: [],
        karanas: [],
        specialYogas: []
      }
    }
  }

  // Obtener todos los datos
  async getAllData(): Promise<PanchangaSimplifiedData> {
    return await this.loadData()
  }

  // Obtener nakshatra por nombre
  async getNakshatraByName(name: string): Promise<NakshatraData | undefined> {
    if (!name) return undefined
    
    const data = await this.loadData()
    const mappedName = getMappedName(name)
    
    console.log(`🔍 Searching nakshatra: "${name}" -> mapped: "${mappedName}"`)
    
    const result = findBestMatch(data.nakshatras, mappedName)
    
    if (result) {
      console.log(`✅ Found nakshatra: ${result.name}`)
    } else {
      console.log(`❌ No nakshatra found for: ${name}`)
    }
    
    return result
  }

  // Obtener tithi por nombre
  async getTithiByName(name: string): Promise<TithiData | undefined> {
    if (!name) return undefined
    
    const data = await this.loadData()
    const mappedName = getMappedName(name)
    
    console.log(`🔍 Searching tithi: "${name}" -> mapped: "${mappedName}"`)
    
    const result = findBestMatch(data.tithis, mappedName)
    
    if (result) {
      console.log(`✅ Found tithi: ${result.name}`)
    } else {
      console.log(`❌ No tithi found for: ${name}`)
    }
    
    return result
  }

  // Obtener vara por nombre
  async getVaraByName(name: string): Promise<VaraData | undefined> {
    if (!name) return undefined
    
    const data = await this.loadData()
    const mappedName = getMappedName(name)
    
    console.log(`🔍 Searching vara: "${name}" -> mapped: "${mappedName}"`)
    
    const result = findBestMatch(data.varas, mappedName)
    
    if (result) {
      console.log(`✅ Found vara: ${result.name}`)
    } else {
      console.log(`❌ No vara found for: ${name}`)
    }
    
    return result
  }

  // Obtener yoga por nombre
  async getYogaByName(name: string): Promise<YogaData | undefined> {
    if (!name) return undefined
    
    const data = await this.loadData()
    const mappedName = getMappedName(name)
    
    console.log(`🔍 Searching yoga: "${name}" -> mapped: "${mappedName}"`)
    
    const result = findBestMatch(data.yogas, mappedName)
    
    if (result) {
      console.log(`✅ Found yoga: ${result.name}`)
    } else {
      console.log(`❌ No yoga found for: ${name}`)
    }
    
    return result
  }

  async getKaranaByName(name: string): Promise<KaranaData | undefined> {
    if (!name) return undefined
    
    const data = await this.loadData()
    const mappedName = getMappedName(name)
    
    console.log(`🔍 Searching karana: "${name}" -> mapped: "${mappedName}"`)
    console.log(`📊 Available karanas:`, data.karanas.map(k => k.name))
    
    const result = findBestMatch(data.karanas, mappedName)
    
    if (result) {
      console.log(`✅ Found karana: ${result.name}`, result)
    } else {
      console.log(`❌ No karana found for: ${name}`)
      console.log(`🔍 Trying exact match...`)
      const exactMatch = data.karanas.find(k => k.name === name || k.name === mappedName)
      if (exactMatch) {
        console.log(`✅ Found exact match:`, exactMatch)
        return exactMatch
      }
    }
    
    return result
  }

  async getSpecialYogaByName(name: string): Promise<SpecialYogaData | undefined> {
    if (!name) return undefined
    
    const data = await this.loadData()
    const mappedName = getMappedName(name)
    
    console.log(`🔍 Searching special yoga: "${name}" -> mapped: "${mappedName}"`)
    console.log(`📊 Available special yogas:`, data.specialYogas.map(y => y.name))
    
    const result = findBestMatch(data.specialYogas, mappedName)
    
    if (result) {
      console.log(`✅ Found special yoga: ${result.name}`, result)
    } else {
      console.log(`❌ No special yoga found for: ${name}`)
      console.log(`🔍 Trying exact match...`)
      const exactMatch = data.specialYogas.find(y => y.name === name || y.name === mappedName)
      if (exactMatch) {
        console.log(`✅ Found exact match:`, exactMatch)
        return exactMatch
      }
    }
    
    return result
  }

  // Obtener recomendaciones completas para un día
  async getDayRecommendations(dayData: {
    tithi?: { name: string }
    vara?: { name: string }
    nakshatra?: { name: string }
    yoga?: { name: string }
    karana?: { name: string }
    specialYogas?: string[]
  }) {
    const recommendations = {
      tithi: null as TithiData | null,
      vara: null as VaraData | null,
      nakshatra: null as NakshatraData | null,
      yoga: null as YogaData | null,
      karana: null as KaranaData | null,
      specialYogas: [] as SpecialYogaData[],
      summary: {
        favorableActivities: [] as string[],
        avoidActivities: [] as string[],
        overallMood: 'neutral' as 'auspicious' | 'inauspicious' | 'neutral'
      }
    }

    // Obtener datos de cada componente
    if (dayData.tithi?.name) {
      recommendations.tithi = await this.getTithiByName(dayData.tithi.name) || null
    }
    if (dayData.vara?.name) {
      recommendations.vara = await this.getVaraByName(dayData.vara.name) || null
    }
    if (dayData.nakshatra?.name) {
      recommendations.nakshatra = await this.getNakshatraByName(dayData.nakshatra.name) || null
    }
    if (dayData.yoga?.name) {
      recommendations.yoga = await this.getYogaByName(dayData.yoga.name) || null
    }
    if (dayData.karana?.name) {
      console.log(`🔄 Loading karana recommendations for: ${dayData.karana.name}`)
      recommendations.karana = await this.getKaranaByName(dayData.karana.name) || null
      console.log(`📋 Karana recommendations result:`, recommendations.karana)
    }
    
    // Cargar yogas especiales
    if (dayData.specialYogas && dayData.specialYogas.length > 0) {
      console.log(`🔄 Loading special yogas:`, dayData.specialYogas)
      for (const yogaName of dayData.specialYogas) {
        const specialYoga = await this.getSpecialYogaByName(yogaName)
        if (specialYoga) {
          recommendations.specialYogas.push(specialYoga)
        }
      }
      console.log(`📋 Special yogas loaded:`, recommendations.specialYogas.length)
    }

    // Compilar actividades favorables y desfavorables
    const allFavorables: string[] = []
    const allDesfavorables: string[] = []

    if (recommendations.tithi) {
      allFavorables.push(...recommendations.tithi.favorables)
      allDesfavorables.push(...recommendations.tithi.desfavorables)
    }
    if (recommendations.vara) {
      allFavorables.push(...recommendations.vara.favorables)
      allDesfavorables.push(...recommendations.vara.desfavorables)
    }
    if (recommendations.nakshatra) {
      allFavorables.push(...recommendations.nakshatra.favorables)
      allDesfavorables.push(...recommendations.nakshatra.desfavorables)
    }
    if (recommendations.yoga) {
      allFavorables.push(...recommendations.yoga.favorables)
      allDesfavorables.push(...recommendations.yoga.desfavorables)
    }
    if (recommendations.karana) {
      allFavorables.push(...recommendations.karana.favorables)
      allDesfavorables.push(...recommendations.karana.desfavorables)
    }
    
    // Incluir yogas especiales
    for (const specialYoga of recommendations.specialYogas) {
      allFavorables.push(...specialYoga.favorables)
      allDesfavorables.push(...specialYoga.desfavorables)
    }

    // Eliminar duplicados
    recommendations.summary.favorableActivities = [...new Set(allFavorables)]
    recommendations.summary.avoidActivities = [...new Set(allDesfavorables)]

    // Determinar el estado general del día
    const auspiciousCount = [recommendations.tithi, recommendations.vara, recommendations.nakshatra, recommendations.yoga, recommendations.karana]
      .filter(item => item && (item.classification?.toLowerCase().includes('auspicious') || item.classification?.toLowerCase().includes('favorable')))
      .length + recommendations.specialYogas.filter(yoga => yoga.polarity === 'positive').length

    const inauspiciousCount = [recommendations.tithi, recommendations.vara, recommendations.nakshatra, recommendations.yoga, recommendations.karana]
      .filter(item => item && (item.classification?.toLowerCase().includes('inauspicious') || item.classification?.toLowerCase().includes('cruel') || item.classification?.toLowerCase().includes('feroz') || item.classification?.toLowerCase().includes('desfavorable')))
      .length + recommendations.specialYogas.filter(yoga => yoga.polarity === 'negative').length

    if (auspiciousCount > inauspiciousCount) {
      recommendations.summary.overallMood = 'auspicious'
    } else if (inauspiciousCount > auspiciousCount) {
      recommendations.summary.overallMood = 'inauspicious'
    }

    return recommendations
  }

  // Buscar por similitud (para nombres con variaciones)
  async findSimilarNakshatra(name: string): Promise<NakshatraData | undefined> {
    const data = await this.loadData()
    const normalizedName = name.toLowerCase().replace(/[^a-z]/g, '')
    
    return data.nakshatras.find(n => {
      const normalizedNakshatra = n.name.toLowerCase().replace(/[^a-z]/g, '')
      return normalizedNakshatra.includes(normalizedName) || normalizedName.includes(normalizedNakshatra)
    })
  }

  async findSimilarTithi(name: string): Promise<TithiData | undefined> {
    const data = await this.loadData()
    const normalizedName = name.toLowerCase().replace(/[^a-z]/g, '')
    
    return data.tithis.find(t => {
      const normalizedTithi = t.name.toLowerCase().replace(/[^a-z]/g, '')
      return normalizedTithi.includes(normalizedName) || normalizedName.includes(normalizedTithi)
    })
  }

  async findSimilarVara(name: string): Promise<VaraData | undefined> {
    const data = await this.loadData()
    const normalizedName = name.toLowerCase().replace(/[^a-z]/g, '')
    
    return data.varas.find(v => {
      const normalizedVara = v.name.toLowerCase().replace(/[^a-z]/g, '')
      return normalizedVara.includes(normalizedName) || normalizedName.includes(normalizedVara)
    })
  }

  async findSimilarYoga(name: string): Promise<YogaData | undefined> {
    const data = await this.loadData()
    const normalizedName = name.toLowerCase().replace(/[^a-z]/g, '')
    
    return data.yogas.find(y => {
      const normalizedYoga = y.name.toLowerCase().replace(/[^a-z]/g, '')
      return normalizedYoga.includes(normalizedName) || normalizedName.includes(normalizedYoga)
    })
  }
}

// Instancia singleton del servicio
export const panchangaSimplifiedService = new PanchangaSimplifiedService()

export default panchangaSimplifiedService
