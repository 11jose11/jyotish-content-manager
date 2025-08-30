// Sistema de cache inteligente para datos del panchanga
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface IndexedData {
  [key: string]: any
}

class PanchangaDataCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private indexes: Map<string, IndexedData> = new Map()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

  // Indexar datos para búsquedas rápidas
  private createIndex(data: any[], keyField: string, searchFields: string[]): IndexedData {
    const index: IndexedData = {}
    
    data.forEach(item => {
      const key = item[keyField]?.toLowerCase() || ''
      index[key] = item
      
      // Crear índices adicionales para búsquedas flexibles
      searchFields.forEach(field => {
        if (item[field]) {
          const searchKey = item[field].toLowerCase()
          if (!index[searchKey]) {
            index[searchKey] = item
          }
        }
      })
    })
    
    return index
  }

  // Cargar y indexar datos JSON
  async loadAndIndexData(filename: string, keyField: string, searchFields: string[] = []): Promise<any> {
    const cacheKey = `index_${filename}`
    
    // Verificar si ya está en cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data
    }

    try {
      console.log(`📂 Loading and indexing: ${filename}`)
      const response = await fetch(`/json-database/${filename}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Extraer el array de datos según la estructura del archivo
      let dataArray: any[] = []
      
      if (filename === 'Nakashatras.json') {
        dataArray = data.nakshatras || []
      } else if (filename === 'TIthi.json') {
        dataArray = data.tithi?.devatas_por_tithi?.brhatsamhita_99_1_2a || []
      } else if (filename === 'karanas.json') {
        dataArray = data.karana?.karanas_detalle || []
      } else if (filename === 'Vara.json') {
        dataArray = data.dias || []
      } else if (filename === 'nitya-yogas.json') {
        dataArray = data.yoga?.tablas?.base_27 || []
      } else if (filename === 'yogas-special.json') {
        dataArray = Object.values(data.yogas || {})
      }
      
      // Crear índice
      const index = this.createIndex(dataArray, keyField, searchFields)
      
      // Guardar en cache
      const cacheEntry: CacheEntry<any> = {
        data: { original: data, indexed: index, array: dataArray },
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      }
      
      this.cache.set(cacheKey, cacheEntry)
      this.indexes.set(filename, index)
      
      console.log(`✅ Indexed ${dataArray.length} items from ${filename}`)
      return cacheEntry.data
      
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error)
      throw error
    }
  }

  // Búsqueda rápida en datos indexados
  async findItem(filename: string, searchTerm: string, searchFields: string[] = ['nombre', 'name', 'tithi', 'vara']): Promise<any> {
    const cacheKey = `index_${filename}`
    const cached = this.cache.get(cacheKey)
    
    if (!cached || Date.now() >= cached.expiresAt) {
      // Recargar datos si expiraron
      await this.loadAndIndexData(filename, 'nombre', searchFields)
    }
    
    const index = this.indexes.get(filename)
    if (!index) {
      return null
    }
    
    const normalizedSearch = searchTerm.toLowerCase().trim()
    
    // Búsqueda directa
    if (index[normalizedSearch]) {
      return index[normalizedSearch]
    }
    
    // Búsqueda parcial
    for (const [, value] of Object.entries(index)) {
      if (value && typeof value === 'object') {
        for (const [, fieldValue] of Object.entries(value)) {
          if (typeof fieldValue === 'string' && 
              (fieldValue.toLowerCase().includes(normalizedSearch) || 
               normalizedSearch.includes(fieldValue.toLowerCase()))) {
            return value
          }
        }
      }
    }
    
    // Búsqueda en campos específicos
    for (const [, value] of Object.entries(index)) {
      for (const field of searchFields) {
        if (value[field] && value[field].toLowerCase().includes(normalizedSearch)) {
          return value
        }
      }
    }
    
    return null
  }

  // Precargar todos los datos
  async preloadAllData(): Promise<void> {
    try {
      console.log('🔄 Preloading all panchanga data...')
      
      await Promise.all([
        this.loadAndIndexData('Nakashatras.json', 'nombre', ['nombre']),
        this.loadAndIndexData('TIthi.json', 'tithi', ['tithi']),
        this.loadAndIndexData('karanas.json', 'nombre', ['nombre']),
        this.loadAndIndexData('Vara.json', 'vara', ['vara', 'es']),
        this.loadAndIndexData('nitya-yogas.json', 'nombre', ['nombre']),
        this.loadAndIndexData('yogas-special.json', 'name', ['name', 'name_sanskrit'])
      ])
      
      console.log('✅ All panchanga data preloaded and indexed')
    } catch (error) {
      console.error('❌ Error preloading data:', error)
    }
  }

  // Limpiar cache expirado
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key)
        console.log(`🗑️ Cleaned up expired cache: ${key}`)
      }
    }
  }

  // Obtener estadísticas del cache
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}

// Exportar instancia singleton
export const panchangaDataCache = new PanchangaDataCache()

// Limpiar cache cada 5 minutos
setInterval(() => {
  panchangaDataCache.cleanup()
}, 5 * 60 * 1000)
