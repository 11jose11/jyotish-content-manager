import { useQuery as useQueryOriginal } from '@tanstack/react-query'
import { useState } from 'react'


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
      
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - API took too long to respond')
      }
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

// Panchanga month hook using the recommended daily endpoint
export const usePanchangaMonth = ({ year, month, latitude, longitude }: PanchangaMonthParams) => {
  return useQueryOriginal({
    queryKey: ['panchanga-month', year, month, latitude, longitude],
    queryFn: async () => {
      try {
        // Use the recommended daily endpoint for each day of the month
        const daysInMonth = new Date(year, month, 0).getDate()
        const allDays: any[] = []
        
        // Load data for each day using the recommended endpoint
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          
          try {
            const queryParams = new URLSearchParams({
              date: dateStr,
              latitude: latitude.toString(),
              longitude: longitude.toString()
            })
            
            const response = await apiClient.get(`/v1/panchanga/calendar/day?${queryParams}`)
            
            if (response) {
              // Extract data from the correct nested structure
              const panchangaData = response.panchanga?.panchanga || response.panchanga || response
              const yogasData = response.yogas || {}
              const positiveYogas = yogasData.positive_yogas || []
              const negativeYogas = yogasData.negative_yogas || []
              const trafficLight = yogasData.summary?.traffic_light?.color || 'neutral'
              
              // Combine all yogas with polarity
              const allYogas = [
                ...positiveYogas.map((yoga: any) => ({ ...yoga, polarity: 'positive' })),
                ...negativeYogas.map((yoga: any) => ({ ...yoga, polarity: 'negative' }))
              ]
              
              
              const dayData = {
                date: dateStr,
                tithi: {
                  name: panchangaData.tithi?.name || 'Unknown',
                  index: panchangaData.tithi?.number || 1
                },
                vara: {
                  name: panchangaData.vara?.name || 'Unknown'
                },
                nakshatra: {
                  name: panchangaData.nakshatra?.name || 'Unknown',
                  pada: panchangaData.nakshatra?.pada || 1
                },
                yoga: {
                  name: panchangaData.yoga?.name || 'Unknown'
                },
                nityaYoga: {
                  name: panchangaData.yoga?.name || 'Unknown'
                },
                karana: {
                  name: panchangaData.karana?.name || 'Unknown'
                },
                specialYogas: allYogas,
                trafficLight: trafficLight
              }
              
              allDays.push(dayData)
            } else {
              // Fallback data if no response
              allDays.push({
                date: dateStr,
                tithi: { name: 'Unknown', index: 1 },
                vara: { name: 'Unknown' },
                nakshatra: { name: 'Unknown', pada: 1 },
                yoga: { name: 'Unknown' },
                nityaYoga: { name: 'Unknown' },
                karana: { name: 'Unknown' },
                specialYogas: [],
                trafficLight: 'neutral'
              })
            }
            
            // Small delay to avoid overwhelming the API
            if (day < daysInMonth) {
              await new Promise(resolve => setTimeout(resolve, 100))
            }
            
          } catch (dayError) {
            // Silent error handling
            // Add fallback data for this day
            allDays.push({
              date: dateStr,
              tithi: { name: 'Unknown', index: 1 },
              vara: { name: 'Unknown' },
              nakshatra: { name: 'Unknown', pada: 1 },
              yoga: { name: 'Unknown' },
              karana: { name: 'Unknown' },
              specialYogas: [],
              trafficLight: 'neutral'
            })
          }
        }
        
        return { days: allDays }
        
      } catch (error: any) {
        // Fallback to individual day requests if daily endpoint fails
        return await loadIndividualDays(year, month, latitude, longitude)
      }
    },
    enabled: !!(year && month && latitude && longitude),
  })
}

// Fallback function for individual day requests
const loadIndividualDays = async (year: number, month: number, latitude: number, longitude: number) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const batchDays: any[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    const queryParams = new URLSearchParams({
      date: dateStr,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      reference_time: 'sunrise'
    })
    
    // Progressive delay based on day number to avoid rate limiting
    const delayMs = Math.min(day * 200, 3000) // 200ms per day, max 3s
    if (day > 1) {
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
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }
      }
      

      if (response && response.panchanga) {
        const panchanga = response.panchanga

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
          
          const yogasResponse = await apiClient.get(`/v1/panchanga/yogas/detect?${yogasQueryParams}`)
          
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
          }
        } catch (yogasError) {
          // Silent error handling for yogas
          // Continue without special yogas for this day
        }

        batchDays.push(dayData)
      } else {
        // No panchanga data for this day
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
      // Silent error handling
      throw new Error(`Failed to load data for day ${day}: ${dayError}`)
    }
  }
  
  return { days: batchDays }
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

// Panchanga recommendations hook - Updated to use new endpoint
export const usePanchangaRecommendations = () => {
  return useQueryOriginal({
    queryKey: ['panchanga-recommendations'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/v1/panchanga/recommendations/panchanga/all')
        return response
      } catch (error) {
        console.warn('Panchanga recommendations API not available, using mock data')
        return {
          data: {
            varas: [],
            tithis: [],
            nakshatras: [],
            nitya_yogas: []
          }
        }
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

// Daily panchanga recommendations hook
export const useDailyPanchangaRecommendations = (params: { date: string; latitude: number; longitude: number }) => {
  return useQueryOriginal({
    queryKey: ['daily-panchanga-recommendations', params],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams({
          date: params.date,
          latitude: params.latitude.toString(),
          longitude: params.longitude.toString()
        })
        
        const response = await apiClient.get(`/v1/panchanga/recommendations/daily?${queryParams}`)
        return response
      } catch (error) {
        console.warn('Daily panchanga recommendations API not available, using mock data')
        return {
          data: {
            date: params.date,
            recommendations: {
              vara: null,
              tithi: null,
              nakshatra: null,
              nitya_yoga: null
            }
          }
        }
      }
    },
    enabled: !!(params.date && params.latitude && params.longitude),
    staleTime: 60 * 60 * 1000, // 1 hour
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
        
        const response = await apiClient.get(`/v1/chesta-bala/monthly?${queryParams}`)
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
        
        const response = await apiClient.get(`/v1/chesta-bala/daily?${queryParams}`)
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

// API health check hook - reconnected after CORS fix
export const useApiHealth = () => {
  return useQueryOriginal({
    queryKey: ['api-health'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/healthz')
        return response
      } catch (error) {
        throw error
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })
}

// Eclipse Seasons hook
export const useEclipseSeasons = (params: { year: number; latitude: number; longitude: number; countryISO: string }) => {
  return useQueryOriginal({
    queryKey: ['eclipse-seasons', params],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams({
          year: params.year.toString(),
          latitude: params.latitude.toString(),
          longitude: params.longitude.toString(),
          countryISO: params.countryISO
        })
        
        const response = await apiClient.get(`/api/eclipse/seasons?${queryParams}`)
        
        // Si la API retorna datos vacíos, usar datos de ejemplo
        if (response.seasons && response.seasons.length === 0) {
          console.info('API retorna datos vacíos, usando datos de ejemplo para demostración')
          throw new Error('No data available')
        }
        
        // Log para debug
        console.log('✅ API response received:', {
          seasonsCount: response.seasons?.length || 0,
          firstSeason: response.seasons?.[0]?.id,
          firstSeasonRashi: response.seasons?.[0]?.startRashi,
          firstSeasonNakshatra: response.seasons?.[0]?.startNakshatra
        })
        
        return response
      } catch (error) {
        console.warn('Eclipse seasons API error, using mock data:', error)
        
        // Check for different types of errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('blocked')
        const isApiAvailable = errorMessage.includes('500') || errorMessage.includes('Internal Server Error')
        const isNotFound = errorMessage.includes('404') || errorMessage.includes('Not Found')
        const isNoData = errorMessage.includes('No data available')
        
        if (isCorsError) {
          console.info('CORS error detected - API exists but CORS not configured, using mock data')
        } else if (isApiAvailable) {
          console.info('API endpoint exists but returned error, using mock data for demonstration')
        } else if (isNotFound) {
          console.info('API endpoint not found, using mock data for demonstration')
        } else if (isNoData) {
          console.info('API returned empty data, using mock data for demonstration')
        } else {
          console.info('API connection issue, using mock data for demonstration')
        }
        
        // Mock data for demonstration
        return {
          seasons: [
            {
              id: "season-1",
              startDate: `${params.year}-03-20T10:00:00Z`,
              endDate: `${params.year}-04-08T15:00:00Z`,
              startRashi: "Pisces",
              startNakshatra: "Revati",
              startNakshatraPada: 4,
              verdict: "Bhoga",
              order: 1,
              ayana: "Uttarayana",
              drgDirection: "North",
              rule87: 3,
              mainPair: {
                start: `${params.year}-03-25T08:00:00Z`,
                end: `${params.year}-04-08T12:00:00Z`,
                duration: 14
              },
              events: [
                {
                  id: "eclipse-1",
                  date: `${params.year}-03-25T08:00:00Z`,
                  type: "Solar",
                  sunRashi: "Pisces",
                  sunNakshatra: "Revati",
                  sunNakshatraPada: 4,
                  moonRashi: "Pisces",
                  moonNakshatra: "Revati",
                  moonNakshatraPada: 4,
                  jupiter: "Taurus",
                  visibility: ["IN", "US", "ES", "MX"],
                  isVisibleInCountry: params.countryISO === "IN",
                  affects18Years: true
                },
                {
                  id: "eclipse-2",
                  date: `${params.year}-04-08T12:00:00Z`,
                  type: "Lunar",
                  sunRashi: "Aries",
                  sunNakshatra: "Ashwini",
                  sunNakshatraPada: 1,
                  moonRashi: "Libra",
                  moonNakshatra: "Chitra",
                  moonNakshatraPada: 2,
                  jupiter: "Taurus",
                  visibility: ["IN", "US", "BR", "AR"],
                  isVisibleInCountry: params.countryISO === "IN",
                  affects18Years: false
                }
              ]
            },
            {
              id: "season-2",
              startDate: `${params.year}-09-15T06:00:00Z`,
              endDate: `${params.year}-10-02T18:00:00Z`,
              startRashi: "Virgo",
              startNakshatra: "Hasta",
              startNakshatraPada: 2,
              verdict: "Mokṣa",
              order: 2,
              ayana: "Dakshinayana",
              drgDirection: "South",
              rule87: 5,
              mainPair: {
                start: `${params.year}-09-18T10:00:00Z`,
                end: `${params.year}-10-02T16:00:00Z`,
                duration: 14
              },
              events: [
                {
                  id: "eclipse-3",
                  date: `${params.year}-09-18T10:00:00Z`,
                  type: "Solar",
                  sunRashi: "Virgo",
                  sunNakshatra: "Hasta",
                  sunNakshatraPada: 2,
                  moonRashi: "Virgo",
                  moonNakshatra: "Hasta",
                  moonNakshatraPada: 2,
                  jupiter: "Gemini",
                  visibility: ["IN", "AU", "JP", "KR"],
                  isVisibleInCountry: params.countryISO === "IN",
                  affects18Years: true
                },
                {
                  id: "eclipse-4",
                  date: `${params.year}-10-02T16:00:00Z`,
                  type: "Lunar",
                  sunRashi: "Libra",
                  sunNakshatra: "Chitra",
                  sunNakshatraPada: 3,
                  moonRashi: "Aries",
                  moonNakshatra: "Ashwini",
                  moonNakshatraPada: 4,
                  jupiter: "Gemini",
                  visibility: ["IN", "US", "CA", "MX"],
                  isVisibleInCountry: params.countryISO === "IN",
                  affects18Years: false
                }
              ]
            }
          ],
          summary: {
            totalEclipses: 4,
            totalSeasons: 2,
            seasonsWith3Events: 0
          }
        }
      }
    },
    enabled: !!(params.year && params.latitude && params.longitude && params.countryISO),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Eclipse Legend hook
export const useEclipseLegend = () => {
  return useQueryOriginal({
    queryKey: ['eclipse-legend'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/eclipse/legend')
        return response
      } catch (error) {
        console.warn('Eclipse legend API not available:', error)
        return {
          content: `
            <h3>Leyenda de Eclipses</h3>
            <p>Los eclipses son eventos astrológicos significativos que pueden tener un impacto profundo en nuestras vidas.</p>
            
            <h4>Tipos de Veredicto:</h4>
            <ul>
              <li><strong>Bhoga:</strong> Eclipses que traen beneficios y oportunidades</li>
              <li><strong>Mokṣa:</strong> Eclipses que traen liberación y transformación</li>
              <li><strong>Neutral:</strong> Eclipses con efectos equilibrados</li>
            </ul>
            
            <h4>Regla 8.7:</h4>
            <p>La regla 8.7 se refiere a la división del día en 8 partes y la noche en 7 partes para determinar la fuerza del eclipse.</p>
            
            <h4>Ventana de 18 años:</h4>
            <p>Los efectos de un eclipse pueden manifestarse hasta 18 años después del evento, especialmente cuando afecta planetas natales importantes.</p>
          `
        }
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

// Eclipse Check mutation function
export const useEclipseCheck = () => {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  
  const mutate = async (requestData: {
    natalPoints: any
    year: number
    latitude: number
    longitude: number
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.post('/api/eclipse/check', requestData)
      setData(response)
      return response
    } catch (err) {
      console.warn('Eclipse check API not available, using mock data:', err)
      
      // Mock data for demonstration
      const mockResponse = {
        matches: [
          {
            planet: "Sun",
            rashi: requestData.natalPoints.sunRashi || "Aries",
            nakshatra: requestData.natalPoints.sunNakshatra || "Ashwini",
            severity: "High",
            benefit: true,
            loss: false,
            prePost: "Pre-eclipse",
            window18Years: "2025-2043"
          },
          {
            planet: "Moon",
            rashi: requestData.natalPoints.moonRashi || "Cancer",
            nakshatra: requestData.natalPoints.moonNakshatra || "Pushya",
            severity: "Medium",
            benefit: false,
            loss: true,
            prePost: "Post-eclipse",
            window18Years: "2025-2043"
          },
          {
            planet: "Mars",
            rashi: requestData.natalPoints.marsRashi || "Scorpio",
            nakshatra: requestData.natalPoints.marsNakshatra || "Anuradha",
            severity: "Low",
            benefit: true,
            loss: false,
            prePost: null,
            window18Years: "2025-2043"
          }
        ]
      }
      
      setData(mockResponse)
      return mockResponse
    } finally {
      setIsLoading(false)
    }
  }
  
  return { data, isLoading, error, mutate }
}

export { apiClient }

