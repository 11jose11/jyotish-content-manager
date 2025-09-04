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

// API Client with improved error handling and CORS support
const apiClient = {
  async get(endpoint: string): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = getHeaders()
    
    console.log(`🌐 Making API request to: ${url}`)
    console.log(`📋 Headers:`, headers)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        mode: 'cors', // Explicitly enable CORS
        credentials: 'omit', // Don't send cookies
      })
      
      clearTimeout(timeoutId)
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`)
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API Error ${response.status}:`, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log(`✅ API Response:`, data)
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ API Request timeout after 30s')
        throw new Error('Request timeout - API took too long to respond')
      }
      console.error('❌ API Error:', error)
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
      },
      {
        name: 'Moon',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Rohiṇī', pada: 2 } }
        }))
      },
      {
        name: 'Mercury',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Kṛttikā', pada: 3 } }
        }))
      },
      {
        name: 'Venus',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Bharaṇī', pada: 4 } }
        }))
      },
      {
        name: 'Mars',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Aśvinī', pada: 1 } }
        }))
      },
      {
        name: 'Jupiter',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Punarvasu', pada: 2 } }
        }))
      },
      {
        name: 'Saturn',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Puṣya', pada: 3 } }
        }))
      },
      {
        name: 'Rahu',
        days: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          position: { nakshatra: { nameIAST: 'Āśleṣā', pada: 4 } }
        }))
      },
      {
        name: 'Ketu',
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

// Panchanga month hook with improved error handling
export const usePanchangaMonth = ({ year, month, latitude, longitude }: PanchangaMonthParams) => {
  return useQueryOriginal({
    queryKey: ['panchanga-month', year, month, latitude, longitude],
    queryFn: async () => {
      // Load data in batches with progressive fallback
      const loadBatch = async (startDay: number, endDay: number) => {
        const batchDays: any[] = []
        
        for (let day = startDay; day <= endDay; day++) {
          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          const queryParams = new URLSearchParams({
            date: dateStr,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            reference_time: 'sunrise'
          })
          
          console.log(`🌐 Processing day ${day}/${endDay}: ${dateStr}`)
          
          // Progressive delay based on day number to avoid rate limiting
          const delayMs = Math.min(day * 200, 3000) // 200ms per day, max 3s
          if (day > startDay) {
            console.log(`⏳ Progressive delay: ${delayMs}ms for day ${day}`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
          }
          
          try {
            // Retry logic with exponential backoff and longer delays
            let response
            let retryCount = 0
            const maxRetries = 8 // Increased retries for problematic days
            
            while (retryCount < maxRetries) {
              try {
                response = await apiClient.get(`/v1/panchanga/precise/daily?${queryParams}`)
                break // Success, exit retry loop
              } catch (error: any) {
                retryCount++
                if (retryCount >= maxRetries) {
                  throw error // Give up after max retries
                }
                
                // Exponential backoff with longer delays
                const retryDelay = Math.min(retryCount * 4000, 20000) // 4s, 8s, 12s, 16s, 20s
                console.log(`🔄 Error on day ${day}, retry ${retryCount}/${maxRetries} in ${retryDelay/1000}s...`)
                console.log(`📋 Error details:`, error.message)
                await new Promise(resolve => setTimeout(resolve, retryDelay))
              }
            }
            
            console.log(`✅ Day ${day} API response received:`, response)

            if (response && response.panchanga) {
              const panchanga = response.panchanga
              console.log(`📅 Day ${day} panchanga data:`, panchanga)

              const dayData: any = {
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
              }

              // Load special yogas for this day using the correct endpoint
              try {
                const yogasQueryParams = new URLSearchParams({
                  date: dateStr,
                  latitude: latitude.toString(),
                  longitude: longitude.toString()
                })
                
                console.log(`🧘 Loading special yogas for day ${day}...`)
                const yogasResponse = await apiClient.get(`/v1/panchanga/yogas/detect?${yogasQueryParams}`)
                console.log(`🧘 Day ${day} yogas response:`, yogasResponse)
                
                if (yogasResponse && (yogasResponse.positive_yogas || yogasResponse.negative_yogas)) {
                  const positiveYogas = yogasResponse.positive_yogas || []
                  const negativeYogas = yogasResponse.negative_yogas || []
                  
                  const allYogas = [
                    ...positiveYogas.map((yoga: any) => ({
                      ...yoga,
                      polarity: 'positive'
                    })),
                    ...negativeYogas.map((yoga: any) => ({
                      ...yoga,
                      polarity: 'negative'
                    }))
                  ]
                  
                  dayData.specialYogas = allYogas as any[]
                  console.log(`🧘 Day ${day} special yogas loaded:`, allYogas.length)
                }
              } catch (yogasError) {
                console.warn(`⚠️ Could not load special yogas for day ${day}:`, yogasError)
                // Continue without special yogas for this day
              }

              batchDays.push(dayData)
            } else {
              console.warn(`⚠️ No panchanga data for day ${day}:`, response)
              // Add a placeholder day to maintain calendar structure
              batchDays.push({
                date: dateStr,
                tithi: { name: 'Unknown', index: 1 },
                vara: { name: 'Unknown' },
                nakshatra: { name: 'Unknown', pada: 1 },
                yoga: { name: 'Unknown' },
                karana: { name: 'Unknown' },
                specialYogas: []
              })
            }
                      } catch (dayError) {
              console.error(`❌ Error fetching day ${day}:`, dayError)
              throw new Error(`Failed to load data for day ${day}: ${dayError}`)
            }
        }
        
        return batchDays
      }
      
      console.log('🌐 Fetching panchanga month data...')
      console.log('📅 Params:', { year, month, latitude, longitude })
      console.log('🔗 API Base URL:', API_BASE_URL)
      
      const daysInMonth = new Date(year, month, 0).getDate()
      let allDays: any[] = []
      let successCount = 0
      let errorCount = 0
      
      // Load data in very small batches with long pauses and batch retry
      const batchSize = 3 // Very small batch size
      for (let batchStart = 1; batchStart <= daysInMonth; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize - 1, daysInMonth)
        console.log(`📦 Loading batch ${Math.ceil(batchStart/batchSize)}: days ${batchStart}-${batchEnd}`)
        
        let batchSuccess = false
        let batchRetryCount = 0
        const maxBatchRetries = 3
        
        while (!batchSuccess && batchRetryCount < maxBatchRetries) {
          try {
            const batchDays = await loadBatch(batchStart, batchEnd)
            allDays = [...allDays, ...batchDays]
            console.log(`✅ Batch ${Math.ceil(batchStart/batchSize)} completed successfully`)
            batchSuccess = true
          } catch (batchError) {
            batchRetryCount++
            console.error(`❌ Batch ${Math.ceil(batchStart/batchSize)} failed (attempt ${batchRetryCount}/${maxBatchRetries}):`, batchError)
            
            if (batchRetryCount >= maxBatchRetries) {
              throw new Error(`Batch ${Math.ceil(batchStart/batchSize)} (days ${batchStart}-${batchEnd}) failed after ${maxBatchRetries} attempts`)
            }
            
            // Wait longer before retrying the entire batch
            const batchRetryDelay = 15000 // 15 seconds
            console.log(`⏳ Retrying batch in ${batchRetryDelay/1000} seconds...`)
            await new Promise(resolve => setTimeout(resolve, batchRetryDelay))
          }
        }
        
        // Very long pause between batches to avoid overwhelming the API
        if (batchEnd < daysInMonth) {
          const pauseTime = 10000 // 10 seconds
          console.log(`⏳ Pausing ${pauseTime/1000} seconds between batches...`)
          await new Promise(resolve => setTimeout(resolve, pauseTime))
        }
      }
      
      // Count successes and errors
      successCount = allDays.filter(day => day.tithi.name !== 'Unknown').length
      errorCount = allDays.filter(day => day.tithi.name === 'Unknown').length
      
      console.log(`📊 Month processing complete: ${successCount} successful, ${errorCount} errors out of ${daysInMonth} days`)
      return { days: allDays }
    },
    enabled: !!(year && month && latitude && longitude),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Increased retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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

// Panchanga recommendations hook
export const usePanchangaRecommendations = () => {
  return useQueryOriginal({
    queryKey: ['panchanga-recommendations'],
    queryFn: async () => {
      try {
        return await apiClient.get('/panchanga/recommendations')
      } catch (error) {
        console.warn('Panchanga recommendations API not available, using mock data')
        return {
          tithis: {},
          nakshatras: {},
          varas: {},
          yogas: {},
          karanas: {}
        }
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

// Calendar month hook - using the correct endpoint
export const useCalendarMonth = (params: { year: number; month: number; latitude: number; longitude: number }) => {
  return useQueryOriginal({
    queryKey: ['calendar-month', params],
    queryFn: async () => {
      try {
        // For now, we'll use a default place_id for Mumbai
        // In a real implementation, you would need to get the place_id from Google Places API
        const place_id = "ChIJwe1EZjDG5zYRaY7iKJzXHmc" // Mumbai place_id
        
        const queryParams = new URLSearchParams({
          year: params.year.toString(),
          month: params.month.toString(),
          place_id: place_id,
          format: 'detailed',
          anchor: 'sunrise'
        })
        
        const response = await apiClient.get(`/v1/calendar/month?${queryParams}`)
        
        // Transform the response to match our expected format
        if (response && response.days) {
          return {
            days: response.days.map((day: any) => ({
              date: day.date,
              planets: Object.entries(day.planets).map(([planetName, planetData]: [string, any]) => ({
                name: planetName,
                nakshatra: {
                  name: planetData.nakshatra,
                  nameIAST: planetData.nakshatra,
                  pada: planetData.pada,
                  index: planetData.nak_index
                },
                rasi: planetData.rasi,
                rasi_index: planetData.rasi_index,
                longitude: planetData.lon_decimal,
                retrograde: planetData.retrograde,
                motion_state: planetData.motion_state
              }))
            })),
            transitions: response.events || [],
            place: response.place,
            year: response.year,
            month: response.month
          }
        }
        
        return response
      } catch (error) {
        console.warn('Calendar API not available, using mock data')
        return mockData.panchangaMonth
      }
    },
    enabled: !!params.year && !!params.month && !!params.latitude && !!params.longitude,
  })
}

// Chesta Bala Monthly Analysis hook
export const useChestaBalaMonthly = (params: { year: number; month: number; latitude: number; longitude: number; planets?: string[] }) => {
  return useQueryOriginal({
    queryKey: ['chesta-bala-monthly', params],
    queryFn: async () => {
      try {
        const defaultPlanets = ['Mars', 'Venus', 'Jupiter', 'Saturn', 'Mercury', 'Sun', 'Moon', 'Rahu', 'Ketu']
        const planetsParam = (params.planets || defaultPlanets).join(',')
        
        const queryParams = new URLSearchParams({
          year: params.year.toString(),
          month: params.month.toString(),
          latitude: params.latitude.toString(),
          longitude: params.longitude.toString(),
          planets: planetsParam
        })
        
        console.log('🔮 Fetching Chesta Bala monthly analysis...')
        const response = await apiClient.get(`/v1/chesta-bala/monthly?${queryParams}`)
        console.log('✅ Chesta Bala monthly response:', response)
        return response
      } catch (error) {
        console.warn('Chesta Bala monthly API not available:', error)
        return {
          summary: {
            total_motion_changes: 0,
            changes_by_planet: {},
            planet_averages: {},
            most_active_planet: null,
            average_chesta_bala: 0
          }
        }
      }
    },
    enabled: !!(params.year && params.month && params.latitude && params.longitude),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Chesta Bala Daily Analysis hook
export const useChestaBalaDaily = (params: { date: string; time?: string; latitude: number; longitude: number; planets?: string[] }) => {
  return useQueryOriginal({
    queryKey: ['chesta-bala-daily', params],
    queryFn: async () => {
      try {
        const defaultPlanets = ['Mars', 'Venus', 'Jupiter', 'Saturn', 'Mercury', 'Sun', 'Moon', 'Rahu', 'Ketu']
        const planetsParam = (params.planets || defaultPlanets).join(',')
        
        const queryParams = new URLSearchParams({
          date: params.date,
          time: params.time || '12:00:00',
          latitude: params.latitude.toString(),
          longitude: params.longitude.toString(),
          planets: planetsParam
        })
        
        console.log('🔮 Fetching Chesta Bala daily analysis...')
        const response = await apiClient.get(`/v1/chesta-bala/daily?${queryParams}`)
        console.log('✅ Chesta Bala daily response:', response)
        return response
      } catch (error) {
        console.warn('Chesta Bala daily API not available:', error)
        return { planets: {} }
      }
    },
    enabled: !!(params.date && params.latitude && params.longitude),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// API health check hook
export const useApiHealth = () => {
  return useQueryOriginal({
    queryKey: ['api-health'],
    queryFn: async () => {
      try {
        console.log('🏥 Checking API health...')
        const response = await apiClient.get('/healthz')
        console.log('✅ API health check passed:', response)
        return response
      } catch (error) {
        console.error('❌ API health check failed:', error)
        throw error
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })
}

export { apiClient }

