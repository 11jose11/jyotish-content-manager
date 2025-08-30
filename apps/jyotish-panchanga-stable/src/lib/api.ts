import { useQuery as useQueryOriginal } from '@tanstack/react-query'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jyotish-api-ndcfqrjivq-uc.a.run.app'
const API_KEY = import.meta.env.VITE_API_KEY

// Types
interface PanchangaMonthParams {
  year: number
  month: number
  latitude: number
  longitude: number
}

// API Client with exponential backoff and timeout
const apiClient = {
  async get(endpoint: string): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = getHeaders()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('API Error:', error)
      throw error
    }
  },

  async post(endpoint: string, data: any): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = getHeaders()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('API Error:', error)
      throw error
    }
  }
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': window.location.origin,
  }
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
  }
  return headers
}

// Mock data for development/testing
const mockData = {
  diagnostics: {
    backend: { ok: true, status: 200, ts: new Date().toISOString() },
    remote: {
      baseUrl: API_BASE_URL,
      ok: true,
      latencyMs: 150,
      endpoints: {
        '/healthz': { ok: true, status: 200 },
        '/positions': { ok: true, status: 200 },
        '/panchanga': { ok: true, status: 200 }
      }
    }
  },
  navataraData: {
    metadata: {
      nakshatras: [
        'Aśvinī', 'Bharaṇī', 'Kṛttikā', 'Rohiṇī', 'Mṛgaśira', 'Ārdrā', 'Punarvasu', 'Puṣya', 'Āśleṣā',
        'Maghā', 'Pūrva Phalgunī', 'Uttara Phalgunī', 'Hasta', 'Citrā', 'Svātī', 'Viśākhā', 'Anurādhā',
        'Jyeṣṭhā', 'Mūla', 'Pūrva Āṣāḍhā', 'Uttara Āṣāḍhā', 'Śravaṇa', 'Dhaniṣṭhā', 'Śatabhiṣā',
        'Pūrva Bhādrapada', 'Uttara Bhādrapada', 'Revatī'
      ],
      roleLabels: [
        'Janma', 'Sampat', 'Vipat', 'Kṣema', 'Pratyak',
        'Sādhana', 'Naidhana', 'Mitra', 'Parama Mitra'
      ]
    },
    mapping: Array.from({ length: 27 }, (_, i) => ({
      relPosition: i + 1,
      nakshatra: {
        index: (i % 27) + 1,
        nameIAST: ['Aśvinī', 'Bharaṇī', 'Kṛttikā', 'Rohiṇī', 'Mṛgaśira', 'Ārdrā', 'Punarvasu', 'Puṣya', 'Āśleṣā',
          'Maghā', 'Pūrva Phalgunī', 'Uttara Phalgunī', 'Hasta', 'Citrā', 'Svātī', 'Viśākhā', 'Anurādhā',
          'Jyeṣṭhā', 'Mūla', 'Pūrva Āṣāḍhā', 'Uttara Āṣāḍhā', 'Śravaṇa', 'Dhaniṣṭhā', 'Śatabhiṣā',
          'Pūrva Bhādrapada', 'Uttara Bhādrapada', 'Revatī'][i % 27],
        pada: (i % 4) + 1
      },
      tara: {
        name: ['Janma', 'Sampat', 'Vipat', 'Kṣema', 'Pratyak',
          'Sādhana', 'Naidhana', 'Mitra', 'Parama Mitra'][i % 9],
        description: 'Descripción de la tara'
      },
      loka: {
        name: i < 9 ? 'Bhu' : i < 18 ? 'Bhuva' : 'Swarga',
        description: 'Descripción del loka'
      },
      deity: {
        name: ['Gaṇeśa', 'Lakṣmī', 'Sūrya', 'Gaurī', 'Skanda',
          'Durgā', 'Śiva', 'Kālī', 'Kṛṣṇa'][i % 9],
        description: 'Descripción de la deidad'
      }
    }))
  },
  positionsMonth: {
    days: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      positions: [
        { planet: 'Sun', nakshatra: { nameIAST: 'Maghā', pada: 1 } },
        { planet: 'Moon', nakshatra: { nameIAST: 'Rohiṇī', pada: 2 } },
        { planet: 'Mercury', nakshatra: { nameIAST: 'Kṛttikā', pada: 3 } },
        { planet: 'Venus', nakshatra: { nameIAST: 'Bharaṇī', pada: 4 } },
        { planet: 'Mars', nakshatra: { nameIAST: 'Aśvinī', pada: 1 } },
        { planet: 'Jupiter', nakshatra: { nameIAST: 'Punarvasu', pada: 2 } },
        { planet: 'Saturn', nakshatra: { nameIAST: 'Puṣya', pada: 3 } },
        { planet: 'Rahu', nakshatra: { nameIAST: 'Āśleṣā', pada: 4 } },
        { planet: 'Ketu', nakshatra: { nameIAST: 'Maghā', pada: 1 } }
      ]
    })),
    planets: [
      {
        name: 'Sun',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Maghā', pada: 1 } }
        }))
      }
    ],
    transitions: []
  },
  panchangaMonth: {
    days: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
      tithi: { name: 'Pratipada', index: 1 },
      vara: { name: 'Ravivara' },
      nakshatra: { name: 'Aśvinī', pada: 1 },
      yoga: { name: 'Vishkumbha' },
      karana: { name: 'Bava' },
      specialYogas: []
    }))
  }
}

// API Info hook
export const useApiInfo = () => {
  return useQueryOriginal({
    queryKey: ['api-info'],
    queryFn: async () => {
      try {
        return await apiClient.get('/info')
      } catch (error) {
        console.warn('API Info not available, using mock data')
        return { status: 'mock', message: 'Using mock data' }
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Diagnostics hook
export const useDiagnostics = () => {
  return useQueryOriginal({
    queryKey: ['diagnostics'],
    queryFn: async () => {
      try {
        return await apiClient.get('/diagnostics/ping')
      } catch (error) {
        console.warn('Diagnostics not available, using mock data')
        return mockData.diagnostics
      }
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  })
}

// Positions month hook
export const usePositionsMonth = (params: { year: number; month: number; latitude: number; longitude: number }) => {
  return useQueryOriginal({
    queryKey: ['positions-month', params],
    queryFn: async () => {
      try {
        // Use POST method with correct endpoint
        const requestBody = {
          year: params.year,
          month: params.month,
          latitude: params.latitude,
          longitude: params.longitude
        }
        
        const response = await apiClient.post('/positions/month', requestBody)
        
        // Transform the response to match our expected format
        if (response && response.planets) {
          return {
            days: response.planets[0]?.days || [],
            planets: response.planets,
            transitions: response.transitions || []
          }
        }
        
        return response
      } catch (error) {
        console.warn('Positions API not available, using mock data')
        return mockData.positionsMonth
      }
    },
    enabled: !!params.year && !!params.month && !!params.latitude && !!params.longitude,
  })
}

// Panchanga month hook
export const usePanchangaMonth = ({ year, month, latitude, longitude }: PanchangaMonthParams) => {
  return useQueryOriginal({
    queryKey: ['panchanga-month', year, month, latitude, longitude],
    queryFn: async () => {
      console.log('🌐 Fetching panchanga month data...')
      console.log('📅 Params:', { year, month, latitude, longitude })
      
      const daysInMonth = new Date(year, month, 0).getDate()
      const allDays: any[] = []
      
      // Use the new GET endpoint for each day
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        const queryParams = new URLSearchParams({
          date: dateStr,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          reference_time: 'sunrise' // Add reference time parameter
        })
        
        console.log(`🌐 API URL: ${API_BASE_URL}/v1/panchanga/precise/daily?${queryParams}`)
        
        try {
          const response = await apiClient.get(`/v1/panchanga/precise/daily?${queryParams}`)
          console.log(`✅ Day ${day} API response received:`, response)

          if (response && response.panchanga) {
            const panchanga = response.panchanga
            console.log(`📅 Day ${day} panchanga data:`, panchanga)

            allDays.push({
              date: dateStr,
              tithi: {
                name: panchanga.tithi?.name || 'Unknown',
                index: panchanga.tithi?.number || 1
              },
              vara: {
                name: panchanga.vara?.name || 'Unknown'
              },
              nakshatra: {
                name: panchanga.nakshatra?.name || 'Unknown',
                pada: panchanga.nakshatra?.pada || 1
              },
              yoga: {
                name: panchanga.yoga?.name || 'Unknown'
              },
              karana: {
                name: panchanga.karana?.name || 'Unknown'
              },
              specialYogas: [] // Will be loaded separately
            })
          } else {
            console.warn(`⚠️ No panchanga data for day ${day}:`, response)
          }
        } catch (dayError) {
          console.error(`❌ Error fetching day ${day}:`, dayError)
          throw dayError // Re-throw to trigger fallback
        }
      }
      
      console.log('📊 All days processed:', allDays.length)
      return { days: allDays }
    },
    enabled: !!(year && month && latitude && longitude),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// Navatara calculation hook
export const useNavataraData = () => {
  return useQueryOriginal({
    queryKey: ['navatara-data'],
    queryFn: async () => {
      try {
        return await apiClient.get('/navatara/data')
      } catch (error) {
        console.warn('Navatara API not available, using mock data')
        return mockData.navataraData
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export { apiClient }

