// Servicio robusto para cargar datos JSON del panchanga
interface JsonDataCache {
  nakshatras: any
  tithis: any
  karanas: any
  varas: any
  yogas: any
  specialYogas: any
}

class JsonDataService {
  private cache: JsonDataCache = {
    nakshatras: null,
    tithis: null,
    karanas: null,
    varas: null,
    yogas: null,
    specialYogas: null
  }

  private loadingPromises: Record<string, Promise<any>> = {}

  // Función para cargar datos JSON con cache y manejo de errores
  private async loadJsonData(filename: string): Promise<any> {
    // Si ya está cargando, esperar
    if (this.loadingPromises[filename] !== undefined) {
      return this.loadingPromises[filename]
    }

    // Si ya está en cache, retornar
    const cacheKey = this.getCacheKey(filename)
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey]
    }

    // Crear promesa de carga
    this.loadingPromises[filename] = this.fetchJsonData(filename)
    
    try {
      const data = await this.loadingPromises[filename]
      this.cache[cacheKey] = data
      return data
    } finally {
      delete this.loadingPromises[filename]
    }
  }

  private async fetchJsonData(filename: string): Promise<any> {
    try {
      console.log(`📂 Loading JSON data: ${filename}`)
      const response = await fetch(`/json-database/${filename}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`✅ Loaded ${filename}:`, data)
      return data
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error)
      throw error
    }
  }

  private getCacheKey(filename: string): keyof JsonDataCache {
    const mapping: Record<string, keyof JsonDataCache> = {
      'Nakashatras.json': 'nakshatras',
      'TIthi.json': 'tithis',
      'karanas.json': 'karanas',
      'Vara.json': 'varas',
      'nitya-yogas.json': 'yogas',
      'yogas-special.json': 'specialYogas'
    }
    return mapping[filename] || 'nakshatras'
  }

  // Función para normalizar texto para búsqueda
  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[āīūṛṝḷḹṃḥ]/g, (match) => {
        const map: Record<string, string> = {
          'ā': 'a', 'ī': 'i', 'ū': 'u',
          'ṛ': 'r', 'ṝ': 'r', 'ḷ': 'l', 'ḹ': 'l', 'ṃ': 'm', 'ḥ': 'h'
        }
        return map[match] || match
      })
      .trim()
  }

  // Buscar nakshatra
  async findNakshatra(searchName: string): Promise<any> {
    try {
      const data = await this.loadJsonData('Nakashatras.json')
      const normalizedSearch = this.normalizeText(searchName)
      
      const nakshatra = data.nakshatras?.find((n: any) => 
        this.normalizeText(n.nombre).includes(normalizedSearch) ||
        this.normalizeText(n.nombre).replace(/[āīūṛṝḷḹṃḥ]/g, (match: string) => {
          const map: Record<string, string> = {
            'ā': 'a', 'ī': 'i', 'ū': 'u', 'ṛ': 'r', 'ṝ': 'r', 'ḷ': 'l', 'ḹ': 'l', 'ṃ': 'm', 'ḥ': 'h'
          }
          return map[match] || match
        }).includes(normalizedSearch)
      )

      if (nakshatra) {
        return {
          name: nakshatra.nombre,
          nameIAST: nakshatra.nombre,
          translation: nakshatra.nombre,
          deity: 'Luna',
          classification: 'Nakshatra',
          recommendations: `Favorables: ${nakshatra.favorables?.join(', ') || 'No disponible'}. Desfavorables: ${nakshatra.desfavorables?.join(', ') || 'No disponible'}`
        }
      }
      return null
    } catch (error) {
      console.error('Error finding nakshatra:', error)
      return null
    }
  }

  // Buscar tithi
  async findTithi(searchName: string): Promise<any> {
    try {
      const data = await this.loadJsonData('TIthi.json')
      const normalizedSearch = this.normalizeText(searchName)
      
      // Buscar en devatas por tithi
      const devata = data.tithi?.devatas_por_tithi?.brhatsamhita_99_1_2a?.find((d: any) => 
        this.normalizeText(d.tithi).includes(normalizedSearch)
      )

      // Buscar en grupos nandadi
      const grupo = data.tithi?.nandadi_sanjna?.grupos?.find((g: any) => 
        this.normalizeText(g.categoria).includes(normalizedSearch)
      )

      if (devata || grupo) {
        return {
          name: searchName,
          nameIAST: searchName,
          translation: searchName,
          element: grupo?.elemento || 'Agua',
          deity: devata?.devata || 'Candra',
          recommendations: grupo ? 
            `${grupo.significado}. ${grupo.no_recomendado ? 'No recomendado para śubhakarmas.' : 'Favorable para actividades.'}` :
            'Tithi lunar tradicional'
        }
      }
      return null
    } catch (error) {
      console.error('Error finding tithi:', error)
      return null
    }
  }

  // Buscar karana
  async findKarana(searchName: string): Promise<any> {
    try {
      const data = await this.loadJsonData('karanas.json')
      const normalizedSearch = this.normalizeText(searchName)
      
      const karana = data.karana?.karanas_detalle?.find((k: any) => 
        this.normalizeText(k.nombre).includes(normalizedSearch)
      )

      if (karana) {
        const devata = data.karana?.devatas?.carakaranas_BS_100_1_2?.[karana.nombre] || 
                       data.karana?.devatas?.sthirakaranas_sagrados_para?.[karana.nombre] || 
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
      console.error('Error finding karana:', error)
      return null
    }
  }

  // Buscar vara
  async findVara(searchName: string): Promise<any> {
    try {
      const data = await this.loadJsonData('Vara.json')
      const normalizedSearch = this.normalizeText(searchName)
      
      const vara = data.dias?.find((v: any) => 
        this.normalizeText(v.vara).includes(normalizedSearch) ||
        this.normalizeText(v.es).includes(normalizedSearch)
      )

      if (vara) {
        return {
          name: vara.vara,
          nameIAST: vara.vara,
          translation: vara.es,
          planet: vara.planeta,
          recommendations: `${vara.descripcion_corta}. ${vara.consejo}. Actividades sugeridas: ${vara.actividades_sugeridas?.join(', ') || 'No disponible'}`
        }
      }
      return null
    } catch (error) {
      console.error('Error finding vara:', error)
      return null
    }
  }

  // Buscar yoga
  async findYoga(searchName: string): Promise<any> {
    try {
      const data = await this.loadJsonData('nitya-yogas.json')
      const normalizedSearch = this.normalizeText(searchName)
      
      const yoga = data.yoga?.tablas?.base_27?.find((y: any) => 
        this.normalizeText(y.nombre).includes(normalizedSearch)
      )

      if (yoga) {
        return {
          name: yoga.nombre,
          nameIAST: yoga.nombre,
          translation: yoga.nombre,
          type: yoga.significado,
          deity: yoga.deidad,
          recommendations: `Deidad: ${yoga.deidad}. Planeta: ${yoga.planeta}. Significado: ${yoga.significado}`
        }
      }
      return null
    } catch (error) {
      console.error('Error finding yoga:', error)
      return null
    }
  }

  // Buscar yogas especiales
  async findSpecialYogas(searchNames: string[]): Promise<any[]> {
    try {
      const data = await this.loadJsonData('yogas-special.json')
      const results: any[] = []
      
      for (const searchName of searchNames) {
        const normalizedSearch = this.normalizeText(searchName)
        
        for (const [key, yoga] of Object.entries(data.yogas || {})) {
          const yogaData = yoga as any
          if (this.normalizeText(key).includes(normalizedSearch) ||
              this.normalizeText(yogaData.name || '').includes(normalizedSearch) ||
              this.normalizeText(yogaData.name_sanskrit || '').includes(normalizedSearch)) {
            results.push({
              name: yogaData.name,
              name_sanskrit: yogaData.name_sanskrit,
              name_spanish: yogaData.name_spanish,
              polarity: yogaData.polarity,
              type: yogaData.type,
              description: yogaData.description,
              detailed_description: yogaData.detailed_description,
              beneficial_activities: yogaData.beneficial_activities,
              avoid_activities: yogaData.avoid_activities,
              notes: yogaData.notes
            })
            break
          }
        }
      }
      
      return results
    } catch (error) {
      console.error('Error finding special yogas:', error)
      return []
    }
  }

  // Función principal para obtener todos los detalles del panchanga
  async getPanchangaDetails(panchangaData: any): Promise<any> {
    try {
      const [
        nakshatraDetails,
        tithiDetails,
        karanaDetails,
        varaDetails,
        yogaDetails,
        specialYogaDetails
      ] = await Promise.all([
        this.findNakshatra(panchangaData.nakshatra?.name || ''),
        this.findTithi(panchangaData.tithi?.name || ''),
        this.findKarana(panchangaData.karana?.name || ''),
        this.findVara(panchangaData.vara?.name || ''),
        this.findYoga(panchangaData.yoga?.name || ''),
        this.findSpecialYogas(panchangaData.specialYogas?.map((y: any) => y.name) || [])
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

  // Función para precargar todos los datos
  async preloadAllData(): Promise<void> {
    try {
      console.log('🔄 Preloading all JSON data...')
      await Promise.all([
        this.loadJsonData('Nakashatras.json'),
        this.loadJsonData('TIthi.json'),
        this.loadJsonData('karanas.json'),
        this.loadJsonData('Vara.json'),
        this.loadJsonData('nitya-yogas.json'),
        this.loadJsonData('yogas-special.json')
      ])
      console.log('✅ All JSON data preloaded successfully')
    } catch (error) {
      console.error('❌ Error preloading JSON data:', error)
    }
  }
}

// Exportar instancia singleton
export const jsonDataService = new JsonDataService()
