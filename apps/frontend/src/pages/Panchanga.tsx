import React, { useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Copy, FileText, Info } from 'lucide-react'
import { usePanchangaMonth } from '@/lib/api'
import { toast } from 'sonner'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

interface SpecialYoga {
    name: string
  type: string
    polarity: 'auspicious' | 'inauspicious'
  detailed_description?: string
  beneficial?: string
  avoid?: string
  notes?: string
}

const Panchanga: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedDayYogas, setSelectedDayYogas] = useState<SpecialYoga[]>([])
  const [isLoadingYogas, setIsLoadingYogas] = useState(false)
  const [dailyYogas, setDailyYogas] = useState<Record<string, SpecialYoga[]>>({})
  const [location, setLocation] = useState<Location>(() => {
    const saved = localStorage.getItem('jyotish-default-location')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      city: 'Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata'
    }
  })

  const { data: panchangaData, isLoading, error } = usePanchangaMonth({
    year: selectedYear,
    month: selectedMonth,
    latitude: location.latitude,
    longitude: location.longitude,
  })

  // Function to load yogas for all days of the month
  const loadAllYogas = async () => {
    if (!panchangaData?.days) return
    
    setIsLoadingYogas(true)
    const newDailyYogas: Record<string, SpecialYoga[]> = {}
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jyotish-api-ndcfqrjivq-uc.a.run.app'
      const API_KEY = import.meta.env.VITE_API_KEY
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
      
      if (API_KEY) {
        headers['X-API-Key'] = API_KEY
      }
      
      // Load yogas for each day
      for (const day of panchangaData.days) {
        if (day && day.date) {
          try {
            const queryParams = new URLSearchParams({
              date: day.date,
              latitude: location.latitude.toString(),
              longitude: location.longitude.toString()
            })
            
            const response = await fetch(`${API_BASE_URL}/v1/panchanga/yogas/detect?${queryParams}`, {
              method: 'GET',
              headers,
              mode: 'cors',
            })
            
            if (response.ok) {
              const data = await response.json()
              
              if (data && (data.positive_yogas || data.negative_yogas)) {
                const positiveYogas = data.positive_yogas || []
                const negativeYogas = data.negative_yogas || []
                
                const allYogas: SpecialYoga[] = [
                  ...positiveYogas.map((yoga: any) => ({
                    ...yoga,
                    polarity: 'auspicious' as const
                  })),
                  ...negativeYogas.map((yoga: any) => ({
                    ...yoga,
                    polarity: 'inauspicious' as const
                  }))
                ]
                
                newDailyYogas[day.date] = allYogas
              } else {
                newDailyYogas[day.date] = []
              }
            } else {
              newDailyYogas[day.date] = []
            }
          } catch (error) {
            console.error(`Error loading yogas for ${day.date}:`, error)
            newDailyYogas[day.date] = []
          }
        }
      }
      
      setDailyYogas(newDailyYogas)
      console.log('🧘 Loaded yogas for all days:', newDailyYogas)
    } catch (error) {
      console.error('Error loading all yogas:', error)
      toast.error('Error al cargar yogas del mes')
    } finally {
      setIsLoadingYogas(false)
    }
  }

  // Load yogas when panchanga data changes
  React.useEffect(() => {
    if (panchangaData?.days && panchangaData.days.length > 0) {
      loadAllYogas()
    }
  }, [panchangaData, location])

  // Function to load special yogas for a specific day
  const loadSpecialYogas = async (date: string) => {
    if (selectedDay === date && selectedDayYogas.length > 0) {
      // Already loaded, just toggle
      setSelectedDay(null)
      setSelectedDayYogas([])
      return
    }

    setSelectedDay(date)
    
    // Use already loaded yogas if available
    if (dailyYogas[date]) {
      setSelectedDayYogas(dailyYogas[date])
      return
    }
    
    // Otherwise load them individually
    setIsLoadingYogas(true)
    
    try {
      // Use the new GET endpoint
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jyotish-api-ndcfqrjivq-uc.a.run.app'
      const API_KEY = import.meta.env.VITE_API_KEY
      
      const queryParams = new URLSearchParams({
        date: date,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString()
      })
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
      
      if (API_KEY) {
        headers['X-API-Key'] = API_KEY
      }
      
      const response = await fetch(`${API_BASE_URL}/v1/panchanga/yogas/detect?${queryParams}`, {
        method: 'GET',
        headers,
        mode: 'cors',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data && (data.positive_yogas || data.negative_yogas)) {
        const positiveYogas = data.positive_yogas || []
        const negativeYogas = data.negative_yogas || []
        
        const allYogas: SpecialYoga[] = [
          ...positiveYogas.map((yoga: any) => ({
            ...yoga,
            polarity: 'auspicious' as const
          })),
          ...negativeYogas.map((yoga: any) => ({
            ...yoga,
            polarity: 'inauspicious' as const
          }))
        ]
        
        setSelectedDayYogas(allYogas)
        console.log(`🧘 Loaded ${allYogas.length} special yogas for ${date}`)
      } else {
        setSelectedDayYogas([])
      }
    } catch (error) {
      console.error('Error loading special yogas:', error)
      toast.error('Error al cargar yogas especiales')
      setSelectedDayYogas([])
    } finally {
      setIsLoadingYogas(false)
    }
  }

  const handleCopyPrompt = () => {
    if (!panchangaData?.days?.[0]) return
    
    const day = panchangaData.days[0]
    const prompt = `# REPORTE DIARIO — ${day.date}
Lugar: ${location.city}
TZ: ${location.timezone}
Ayanāṁśa: True Citra Paksha (Lahiri)

Tithi: ${day.tithi.name} (${day.tithi.index})
Vara: ${day.vara.name}
Nakṣatra: ${day.nakshatra.name} (p${day.nakshatra.pada})
Yoga: ${day.yoga.name}
Karana: ${day.karana.name}

${day.specialYogas && Array.isArray(day.specialYogas) && day.specialYogas.length > 0 ? `Yogas especiales: ${day.specialYogas.map((y: any) => y.name).join(', ')}` : 'Sin yogas especiales'}

Instrucciones: consejo práctico sin tecnicismos, tono positivo, 90–120 palabras.`

    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copiado al portapapeles')
  }

  const handleSavePrompt = () => {
    if (!panchangaData?.days?.[0]) return
    
    const day = panchangaData.days[0]
    const prompt = `# REPORTE DIARIO — ${day.date}
Lugar: ${location.city}
TZ: ${location.timezone}
Ayanāṁśa: True Citra Paksha (Lahiri)

Tithi: ${day.tithi.name} (${day.tithi.index})
Vara: ${day.vara.name}
Nakṣatra: ${day.nakshatra.name} (p${day.nakshatra.pada})
Yoga: ${day.yoga.name}
Karana: ${day.karana.name}

${day.specialYogas && Array.isArray(day.specialYogas) && day.specialYogas.length > 0 ? `Yogas especiales: ${day.specialYogas.map((y: any) => y.name).join(', ')}` : 'Sin yogas especiales'}

Instrucciones: consejo práctico sin tecnicismos, tono positivo, 90–120 palabras.`

    const blob = new Blob([prompt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `panchanga-${day.date}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Prompt guardado como archivo')
  }

  const renderCalendar = () => {
    console.log('renderCalendar called, panchangaData:', panchangaData)
    
    if (!panchangaData?.days) {
      console.log('No panchangaData or days, returning null')
      return null
    }
    
    console.log('Panchanga days count:', panchangaData.days.length)
    console.log('First day sample:', panchangaData.days[0])
    
    const days = panchangaData.days.filter(day => day && day.date) // Filter out null/undefined days
    
    // Get the first day of the month and its day of week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
    const firstDayWeekday = firstDayOfMonth.getDay()
    
    // Get the number of days in the month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    
    console.log('Calendar info:', {
      firstDayOfMonth: firstDayOfMonth.toISOString(),
      firstDayWeekday,
      daysInMonth,
      daysAvailable: days.length
    })
    
    // Create calendar grid
    const calendarDays = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null)
    }
    
    // Add the actual days of the month
    for (let i = 0; i < daysInMonth; i++) {
      const dayIndex = i
      if (dayIndex < days.length && days[dayIndex]) {
        calendarDays.push(days[dayIndex])
      } else {
        // If we don't have data for this day, create a placeholder
        const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`
        calendarDays.push({
          date: dateStr,
          tithi: { name: 'Loading...', index: 0 },
          vara: { name: 'Loading...' },
          nakshatra: { name: 'Loading...', pada: 0 },
          yoga: { name: 'Loading...' },
          karana: { name: 'Loading...' },
          specialYogas: []
        })
      }
    }
    
    // Group into weeks
    const weeks = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      const week = calendarDays.slice(i, i + 7)
      weeks.push(week)
    }
    
    console.log('Calendar weeks count:', weeks.length)
    console.log('Calendar days total:', calendarDays.length)
    
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    return (
      <div className="space-y-2">
        {/* Header with day names */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((dayName, index) => (
            <div key={index} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid gap-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day: any, dayIndex: number) => (
                <Card key={dayIndex} className={`p-2 min-h-[120px] ${!day ? 'bg-muted/20' : 'cursor-pointer hover:bg-accent/50 transition-colors'} ${selectedDay === day?.date ? 'ring-2 ring-primary' : ''}`}>
                  {day ? (
                    <>
                      <div className="text-center text-sm font-medium mb-2">
                        {new Date(day.date).getDate()}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="text-blue-600 font-medium">
                          {day.tithi?.name || 'Unknown'} ({day.tithi?.index || 0})
                        </div>
                        <div className="text-green-600">
                          {day.vara?.name || 'Unknown'}
                        </div>
                        <div className="text-purple-600">
                          {day.nakshatra?.name || 'Unknown'} p{day.nakshatra?.pada || 0}
                        </div>
                        <div className="text-orange-600">
                          {day.yoga?.name || 'Unknown'}
                        </div>
                        <div className="text-red-600">
                          {day.karana?.name || 'Unknown'}
                        </div>
                        
                        {/* Special Yogas Display */}
                        {dailyYogas[day.date] && dailyYogas[day.date].length > 0 && (
                          <div className="mt-2 space-y-1">
                            {dailyYogas[day.date].slice(0, 2).map((yoga, index) => (
                              <div
                                key={index}
                                className={`text-xs px-1 py-0.5 rounded text-center font-medium ${
                                  yoga.polarity === 'auspicious' 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}
                              >
                                {yoga.name}
                              </div>
                            ))}
                            {dailyYogas[day.date].length > 2 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{dailyYogas[day.date].length - 2} más
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Yogas indicator */}
                        <div className="flex items-center justify-center mt-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (day.date) {
                                    loadSpecialYogas(day.date)
                                  }
                                }}
                                disabled={isLoadingYogas && selectedDay === day.date}
                              >
                                {isLoadingYogas && selectedDay === day.date ? (
                                  <div className="h-2 w-2 animate-spin rounded-full border border-primary border-t-transparent" />
                                ) : (
                                  <Info className="h-2 w-2" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver todos los yogas especiales</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground text-xs">
                      {/* Empty cell */}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
      <Card>
        <CardHeader>
            <CardTitle className="text-red-600">Error al cargar datos</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
              No se pudieron cargar los datos de Pañchāṅga.
            </p>
        </CardContent>
      </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📅 Calendario Pañchāṅga</h1>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>
            Selecciona el año, mes y ubicación para los cálculos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Año</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            
            <div>
              <Label>Mes</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>
                      {new Date(2024, month - 1).toLocaleDateString('es', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            
            <div>
              <Label>Ciudad</Label>
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Buscar ciudad..."
              />
            </div>
            
            <div>
              <Label>Zona Horaria</Label>
              <Input
                placeholder="Zona horaria"
                value={location.timezone}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario Mensual</CardTitle>
              <CardDescription>
            Tithi, Vara, Nakshatra, Yoga y Karana
              </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando datos...</p>
            </div>
          ) : (
            renderCalendar()
          )}
        </CardContent>
      </Card>

      {/* Special Yogas Panel */}
      {selectedDay && selectedDayYogas.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧘</span>
              Yogas Especiales - {new Date(selectedDay).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDay(null)
                  setSelectedDayYogas([])
                }}
                className="ml-auto"
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Auspicious Yogas */}
                                  <div>
                <h4 className="font-semibold text-green-600 mb-2">Yogas Auspiciosos</h4>
                <div className="space-y-2">
                  {selectedDayYogas
                    .filter((yoga) => yoga.polarity === 'auspicious')
                    .map((yoga, index) => (
                      <div key={index} className="p-3 border border-green-200 rounded-lg bg-green-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="text-xs">
                                        {yoga.name}
                                      </Badge>
                          <span className="text-xs text-muted-foreground">
                            {yoga.type}
                          </span>
                                          </div>
                        <p className="text-sm mb-2">{yoga.detailed_description || yoga.beneficial}</p>
                        {yoga.avoid && (
                          <p className="text-xs text-destructive">
                            <strong>Evitar:</strong> {yoga.avoid}
                          </p>
                        )}
                        {yoga.notes && (
                          <p className="text-xs text-muted-foreground">{yoga.notes}</p>
                        )}
                      </div>
                    ))}
                  {selectedDayYogas.filter((yoga) => yoga.polarity === 'auspicious').length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay yogas auspiciosos este día</p>
                  )}
                </div>
                          </div>
                          
              {/* Inauspicious Yogas */}
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Yogas Inauspiciosos</h4>
                <div className="space-y-2">
                  {selectedDayYogas
                    .filter((yoga) => yoga.polarity === 'inauspicious')
                    .map((yoga, index) => (
                      <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="text-xs">
                                    {yoga.name}
                                  </Badge>
                          <span className="text-xs text-muted-foreground">
                            {yoga.type}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{yoga.detailed_description || yoga.beneficial}</p>
                        {yoga.avoid && (
                          <p className="text-xs text-destructive">
                            <strong>Evitar:</strong> {yoga.avoid}
                          </p>
                        )}
                        {yoga.notes && (
                          <p className="text-xs text-muted-foreground">{yoga.notes}</p>
                        )}
                  </div>
                    ))}
                  {selectedDayYogas.filter((yoga) => yoga.polarity === 'inauspicious').length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay yogas inauspiciosos este día</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Yogas */}
        {panchangaData?.days && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auspicious Yogas */}
                    <Card>
                      <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🧘</span>
                  Yogas Auspiciosos
                </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                  {panchangaData.days
                    .filter((day: any) => day.specialYogas && Array.isArray(day.specialYogas))
                    .flatMap((day: any) =>
                      day.specialYogas.filter((yoga: any) => yoga.polarity === 'auspicious')
                    ).map((yoga: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                              <div className="font-medium">{yoga.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(panchangaData.days.find((d: any) =>
                            d.specialYogas && d.specialYogas.some((y: any) => y.name === yoga.name)
                          )?.date || '').toLocaleDateString()}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {yoga.reason}
                              </div>
                            </div>
                          ))}
                  {panchangaData.days
                    .filter((day: any) => day.specialYogas && Array.isArray(day.specialYogas))
                    .flatMap((day: any) =>
                      day.specialYogas.filter((yoga: any) => yoga.polarity === 'auspicious')
                    ).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No hay yogas auspiciosos este mes
                    </div>
                  )}
                        </div>
                      </CardContent>
                    </Card>
                    
            {/* Inauspicious Yogas */}
                    <Card>
                      <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🧘</span>
                  Yogas Inauspiciosos
                </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                  {panchangaData.days
                    .filter((day: any) => day.specialYogas && Array.isArray(day.specialYogas))
                    .flatMap((day: any) =>
                      day.specialYogas.filter((yoga: any) => yoga.polarity === 'inauspicious')
                    ).map((yoga: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                              <div className="font-medium">{yoga.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(panchangaData.days.find((d: any) =>
                            d.specialYogas && d.specialYogas.some((y: any) => y.name === yoga.name)
                          )?.date || '').toLocaleDateString()}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          {yoga.reason}
                        </div>
                      </div>
                    ))}
                  {panchangaData.days
                    .filter((day: any) => day.specialYogas && Array.isArray(day.specialYogas))
                    .flatMap((day: any) =>
                      day.specialYogas.filter((yoga: any) => yoga.polarity === 'inauspicious')
                    ).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No hay yogas inauspiciosos este mes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Daily Prompt */}
      {panchangaData?.days?.[0] && (
        <Card>
          <CardHeader>
            <CardTitle>Prompt IA Diario</CardTitle>
            <CardDescription>
              Genera un prompt para análisis del día seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={`# REPORTE DIARIO — ${panchangaData.days[0].date}
Lugar: ${location.city}
TZ: ${location.timezone}
Ayanāṁśa: True Citra Paksha (Lahiri)

Tithi: ${panchangaData.days[0].tithi.name} (${panchangaData.days[0].tithi.index})
Vara: ${panchangaData.days[0].vara.name}
Nakṣatra: ${panchangaData.days[0].nakshatra.name} (p${panchangaData.days[0].nakshatra.pada})
Yoga: ${panchangaData.days[0].yoga.name}
Karana: ${panchangaData.days[0].karana.name}

${panchangaData.days[0].specialYogas && Array.isArray(panchangaData.days[0].specialYogas) && panchangaData.days[0].specialYogas.length > 0 ? `Yogas especiales: ${panchangaData.days[0].specialYogas.map((y: any) => y.name).join(', ')}` : 'Sin yogas especiales'}

Instrucciones: consejo práctico sin tecnicismos, tono positivo, 90–120 palabras.`}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={handleCopyPrompt}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button onClick={handleSavePrompt}>
                <FileText className="h-4 w-4 mr-2" />
                Guardar .txt
              </Button>
            </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}

export default Panchanga
