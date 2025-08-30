// Servicio optimizado para datos del panchanga
import { panchangaDataCache } from './panchangaDataCache'

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
  name_sanskrit?: string
  name_spanish?: string
  polarity?: string
  type?: string
  description?: string
  detailed_description?: string
  beneficial_activities?: string[]
  avoid_activities?: string[]
  notes?: string
}

class OptimizedPanchangaService {
  private isPreloaded = false

  // Precargar todos los datos al inicializar
  async initialize(): Promise<void> {
    if (!this.isPreloaded) {
      await panchangaDataCache.preloadAllData()
      this.isPreloaded = true
    }
  }

  // Buscar nakshatra con cache optimizado
  async findNakshatra(searchName: string): Promise<PanchangaElement | null> {
    try {
      const nakshatra = await panchangaDataCache.findItem('Nakashatras.json', searchName, ['nombre'])
      
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

  // Buscar tithi con cache optimizado
  async findTithi(searchName: string): Promise<PanchangaElement | null> {
    try {
      const tithi = await panchangaDataCache.findItem('TIthi.json', searchName, ['tithi'])
      
      if (tithi) {
        return {
          name: searchName,
          nameIAST: searchName,
          translation: searchName,
          element: 'Agua',
          deity: tithi.devata || 'Candra',
          recommendations: 'Tithi lunar tradicional'
        }
      }
      return null
    } catch (error) {
      console.error('Error finding tithi:', error)
      return null
    }
  }

  // Buscar karana con cache optimizado
  async findKarana(searchName: string): Promise<PanchangaElement | null> {
    try {
      const karana = await panchangaDataCache.findItem('karanas.json', searchName, ['nombre'])
      
      if (karana) {
        return {
          name: karana.nombre,
          nameIAST: karana.nombre,
          translation: karana.nombre,
          deity: 'Unknown',
          recommendations: `${karana.favorable}${karana.desfavorable ? `. Desfavorable: ${karana.desfavorable}` : ''}`
        }
      }
      return null
    } catch (error) {
      console.error('Error finding karana:', error)
      return null
    }
  }

  // Buscar vara con cache optimizado
  async findVara(searchName: string): Promise<PanchangaElement | null> {
    try {
      const vara = await panchangaDataCache.findItem('Vara.json', searchName, ['vara', 'es'])
      
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

  // Buscar yoga con cache optimizado
  async findYoga(searchName: string): Promise<PanchangaElement | null> {
    try {
      const yoga = await panchangaDataCache.findItem('nitya-yogas.json', searchName, ['nombre'])
      
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

  // Buscar yogas especiales con cache optimizado
  async findSpecialYogas(searchNames: string[]): Promise<SpecialYogaElement[]> {
    try {
      const results: SpecialYogaElement[] = []
      
      for (const searchName of searchNames) {
        const yoga = await panchangaDataCache.findItem('yogas-special.json', searchName, ['name', 'name_sanskrit'])
        
        if (yoga) {
          results.push({
            name: yoga.name,
            name_sanskrit: yoga.name_sanskrit,
            name_spanish: yoga.name_spanish,
            polarity: yoga.polarity,
            type: yoga.type,
            description: yoga.description,
            detailed_description: yoga.detailed_description,
            beneficial_activities: yoga.beneficial_activities,
            avoid_activities: yoga.avoid_activities,
            notes: yoga.notes
          })
        }
      }
      
      return results
    } catch (error) {
      console.error('Error finding special yogas:', error)
      return []
    }
  }

  // Función principal optimizada para obtener todos los detalles
  async getPanchangaDetails(panchangaData: any): Promise<any> {
    try {
      // Asegurar que los datos estén precargados
      await this.initialize()
      
      console.log('🚀 Loading panchanga details with optimized cache...')
      
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

  // Obtener estadísticas del cache
  getCacheStats(): { size: number; entries: string[] } {
    return panchangaDataCache.getStats()
  }
}

// Exportar instancia singleton
export const optimizedPanchangaService = new OptimizedPanchangaService()
