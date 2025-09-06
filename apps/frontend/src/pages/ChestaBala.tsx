import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useChestaBalaMonthly } from '@/lib/api'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import { ChestaBalaPanel } from '@/components/ChestaBalaPanel'
import { ChestaBalaDailyPanel } from '@/components/ChestaBalaDailyPanel'
import { useChestaBalaDaily } from '@/lib/api'
import { TrendingUp, TrendingDown, Activity, Clock, MapPin } from 'lucide-react'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

interface ChestaBalaData {
  planet: string
  changes: Array<{
    date: string
    type: 'retrograde' | 'direct' | 'stationary'
    longitude: number
    speed: number
    significance: string
  }>
  summary: {
    totalChanges: number
    retrogradePeriods: number
    directPeriods: number
    averageSpeed: number
  }
}

const PLANETS = [
  { name: 'Sun', label: 'Sol', color: 'bg-yellow-500' },
  { name: 'Moon', label: 'Luna', color: 'bg-gray-400' },
  { name: 'Mars', label: 'Marte', color: 'bg-red-500' },
  { name: 'Mercury', label: 'Mercurio', color: 'bg-orange-500' },
  { name: 'Jupiter', label: 'Júpiter', color: 'bg-blue-500' },
  { name: 'Venus', label: 'Venus', color: 'bg-green-500' },
  { name: 'Saturn', label: 'Saturno', color: 'bg-purple-500' },
  { name: 'Rahu', label: 'Rahu', color: 'bg-indigo-500' },
  { name: 'Ketu', label: 'Ketu', color: 'bg-pink-500' }
]

const ChestaBala: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
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
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>(PLANETS.map(p => p.name))
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'daily'>('overview')
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [selectedMonthForDebug, setSelectedMonthForDebug] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Cargar datos de Chesta Bala para cada mes del año
  const chestaBalaData: Array<{
    month: number
    data: any
    isLoading: boolean
    error: any
  }> = []
  for (let month = 1; month <= 12; month++) {
    const { data, isLoading, error } = useChestaBalaMonthly({
      year: selectedYear,
      month,
      latitude: location.latitude,
      longitude: location.longitude,
      planets: selectedPlanets
    })
    chestaBalaData.push({ month, data, isLoading, error })
  }

  // Cargar datos diarios de Chesta Bala
  const { data: dailyData, isLoading: dailyLoading } = useChestaBalaDaily({
    date: selectedDate,
    latitude: location.latitude,
    longitude: location.longitude,
    planets: selectedPlanets
  })

  // Procesar datos para identificar cambios importantes
  const processChestaBalaData = () => {
    const planetChanges: Record<string, ChestaBalaData> = {}
    
    console.log('🔍 Processing Chesta Bala data:', chestaBalaData)
    
    PLANETS.forEach(planet => {
      if (!selectedPlanets.includes(planet.name)) return
      
      const changes: ChestaBalaData['changes'] = []
      let totalChanges = 0
      let retrogradePeriods = 0
      let directPeriods = 0
      let totalSpeed = 0
      let speedCount = 0

      // Procesar cada mes
      chestaBalaData.forEach(({ data, month }) => {
        console.log(`📊 Month ${month} data for ${planet.name}:`, data)
        
        // Verificar la estructura real de la API de Chesta Bala
        if (data?.summary?.changes_by_planet?.[planet.name]) {
          const planetChanges = data.summary.changes_by_planet[planet.name]
          console.log(`🌍 Planet changes for ${planet.name}:`, planetChanges)
          
          // Procesar cada cambio de movimiento
          planetChanges.forEach((change: any) => {
            const changeType = change.to_state === 'vakra' ? 'retrograde' : 
                             change.to_state === 'anuvakra' ? 'direct' : 'stationary'
            
            changes.push({
              date: change.date,
              type: changeType,
              longitude: 0, // No disponible en la API actual
              speed: 1.0, // No disponible en la API actual
              significance: getSignificance(changeType, planet.name)
            })
            totalChanges++
            
            if (changeType === 'retrograde') retrogradePeriods++
            if (changeType === 'direct') directPeriods++
          })
        }
        
        // Calcular velocidad promedio desde los promedios del planeta
        if (data?.summary?.planet_averages?.[planet.name]) {
          const average = data.summary.planet_averages[planet.name]
          totalSpeed += average
          speedCount++
        }
      })

      planetChanges[planet.name] = {
        planet: planet.name,
        changes: changes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        summary: {
          totalChanges,
          retrogradePeriods,
          directPeriods,
          averageSpeed: speedCount > 0 ? totalSpeed / speedCount : 1.0
        }
      }
    })

    console.log('✅ Processed planet changes:', planetChanges)
    return planetChanges
  }

  const getSignificance = (type: string, planet: string): string => {
    const significanceMap: Record<string, Record<string, string>> = {
      retrograde: {
        Sun: 'Energía solar interna. Tiempo para reflexión sobre la identidad.',
        Moon: 'Emociones internas. Tiempo para introspección emocional.',
        Mars: 'Período de introspección y paciencia. Evitar decisiones impulsivas.',
        Mercury: 'Comunicación confusa. Revisar contratos y acuerdos.',
        Jupiter: 'Sabiduría interna. Tiempo para reflexión espiritual.',
        Venus: 'Relaciones requieren paciencia. Revisar valores personales.',
        Saturn: 'Disciplina y responsabilidad. Tiempo de consolidación.',
        Rahu: 'Deseos internos. Tiempo para examinar las ilusiones.',
        Ketu: 'Espiritualidad profunda. Tiempo para desapego y liberación.'
      },
      direct: {
        Sun: 'Energía solar activa. Momento para liderazgo y autoridad.',
        Moon: 'Emociones fluidas. Buen momento para conexiones emocionales.',
        Mars: 'Energía activa y decisiva. Momento para tomar acción.',
        Mercury: 'Comunicación clara. Buen momento para negociaciones.',
        Jupiter: 'Expansión y crecimiento. Oportunidades de aprendizaje.',
        Venus: 'Relaciones armoniosas. Creatividad y belleza florecen.',
        Saturn: 'Estructura y estabilidad. Tiempo para construir.',
        Rahu: 'Deseos activos. Oportunidades de crecimiento material.',
        Ketu: 'Espiritualidad activa. Momento para sabiduría y liberación.'
      },
      stationary: {
        Sun: 'Energía solar concentrada. Momento de gran autoridad.',
        Moon: 'Emociones intensas. Momentos de gran sensibilidad.',
        Mars: 'Energía concentrada. Momento de gran poder.',
        Mercury: 'Comunicación intensa. Atención a detalles.',
        Jupiter: 'Sabiduría profunda. Momentos de revelación.',
        Venus: 'Relaciones intensas. Momentos de gran belleza.',
        Saturn: 'Disciplina extrema. Momentos de gran responsabilidad.',
        Rahu: 'Deseos intensos. Momentos de gran transformación.',
        Ketu: 'Espiritualidad intensa. Momentos de gran sabiduría.'
      }
    }
    return significanceMap[type]?.[planet] || 'Cambio significativo en la energía planetaria.'
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'retrograde': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'direct': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'stationary': return <Activity className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeBadge = (type: string) => {
    const variants = {
      retrograde: 'destructive' as const,
      direct: 'default' as const,
      stationary: 'secondary' as const
    }
    return variants[type as keyof typeof variants] || 'outline'
  }

  const processedData = processChestaBalaData()

  const handlePlanetToggle = (planet: string) => {
    setSelectedPlanets(prev => 
      prev.includes(planet) 
        ? prev.filter(p => p !== planet)
        : [...prev, planet]
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANETS.map(planet => {
          const data = processedData[planet.name]
          if (!data) return null

          return (
            <Card key={planet.name} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${planet.color}`} />
                    <CardTitle className="text-lg">{planet.label}</CardTitle>
                  </div>
                  <Badge variant={selectedPlanets.includes(planet.name) ? 'default' : 'outline'}>
                    {data.summary.totalChanges} cambios
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Períodos retrógrados:</span>
                    <span className="font-medium">{data.summary.retrogradePeriods}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Períodos directos:</span>
                    <span className="font-medium">{data.summary.directPeriods}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Velocidad promedio:</span>
                    <span className="font-medium">{data.summary.averageSpeed.toFixed(2)}°/día</span>
                  </div>
                  
                  {data.changes.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Próximos cambios:</p>
                      <div className="space-y-1">
                        {data.changes.slice(0, 2).map((change, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {getChangeIcon(change.type)}
                            <span>{new Date(change.date).toLocaleDateString('es-ES')}</span>
                            <Badge variant={getChangeBadge(change.type)} className="text-xs">
                              {change.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderDetailed = () => (
    <div className="space-y-6">
      {PLANETS.map(planet => {
        const data = processedData[planet.name]
        if (!data || data.changes.length === 0) return null

        return (
          <Card key={planet.name}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${planet.color}`} />
                <CardTitle>{planet.label} - Cambios de Velocidad {selectedYear}</CardTitle>
              </div>
              <CardDescription>
                {data.summary.totalChanges} cambios detectados durante el año
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.changes.map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getChangeIcon(change.type)}
                      <div>
                        <p className="font-medium">
                          {new Date(change.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Longitud: {change.longitude.toFixed(2)}° | Velocidad: {change.speed.toFixed(2)}°/día
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getChangeBadge(change.type)} className="mb-2">
                        {change.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        {change.significance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Chesta Bala Anual</h1>
          <p className="text-muted-foreground">
            Análisis de cambios de velocidad planetaria durante el año
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{location.city}</span>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Año</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Ubicación</label>
              <LocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Seleccionar ubicación"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Planetas</label>
              <div className="flex flex-wrap gap-2">
                {PLANETS.map(planet => (
                  <Button
                    key={planet.name}
                    variant={selectedPlanets.includes(planet.name) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlanetToggle(planet.name)}
                    className="h-8"
                  >
                    <div className={`w-2 h-2 rounded-full ${planet.color} mr-2`} />
                    {planet.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary Panels */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Resúmenes Mensuales de Chesta Bala</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chestaBalaData.map(({ month, data, isLoading }) => {
            const monthName = new Date(selectedYear, month - 1).toLocaleDateString('es-ES', { month: 'long' })
            return (
              <div key={month} className="space-y-2">
                <h3 className="text-lg font-semibold capitalize">{monthName} {selectedYear}</h3>
                <ChestaBalaPanel 
                  summary={data?.summary || {
                    total_motion_changes: 0,
                    changes_by_planet: {},
                    planet_averages: {},
                    most_active_planet: null,
                    average_chesta_bala: 0
                  }}
                  isLoading={isLoading}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'overview' | 'detailed' | 'daily')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="detailed">Vista Detallada</TabsTrigger>
          <TabsTrigger value="daily">Análisis Diario</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="detailed" className="mt-6">
          {renderDetailed()}
        </TabsContent>
        
        <TabsContent value="daily" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <ChestaBalaDailyPanel 
              planets={dailyData?.planets || {}}
              date={selectedDate}
              isLoading={dailyLoading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estado de Datos</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? 'Ocultar' : 'Mostrar'} Debug
            </Button>
          </div>
        </CardHeader>
        {showDebugInfo && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Meses cargando:</p>
                  <p>{chestaBalaData.filter(({ isLoading }) => isLoading).length}/12</p>
                </div>
                <div>
                  <p className="font-medium">Meses con datos:</p>
                  <p>{chestaBalaData.filter(({ data }) => data).length}/12</p>
                </div>
                <div>
                  <p className="font-medium">Meses con errores:</p>
                  <p>{chestaBalaData.filter(({ error }) => error).length}/12</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Datos por mes:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {chestaBalaData.map(({ month, data, isLoading, error }) => (
                    <div key={month} className="p-2 border rounded">
                      <p className="font-medium">Mes {month}</p>
                      <p className={isLoading ? 'text-blue-500' : error ? 'text-red-500' : data ? 'text-green-500' : 'text-gray-500'}>
                        {isLoading ? 'Cargando...' : error ? 'Error' : data ? 'Con datos' : 'Sin datos'}
                      </p>
                      {data && (
                        <div className="text-xs text-muted-foreground">
                          <p className="mb-1">Estructura:</p>
                          <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto max-h-20">
                            {JSON.stringify(data, null, 2).substring(0, 200)}...
                          </pre>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-1 h-6 text-xs"
                            onClick={() => setSelectedMonthForDebug(month)}
                          >
                            Ver completo
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading State */}
      {chestaBalaData.some(({ isLoading }) => isLoading) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span>Cargando datos de Chesta Bala...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {chestaBalaData.some(({ error }) => error) && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p>Error al cargar algunos datos de Chesta Bala</p>
              <p className="text-sm text-muted-foreground mt-1">
                Algunos meses pueden no estar disponibles
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!chestaBalaData.some(({ isLoading }) => isLoading) && 
       !chestaBalaData.some(({ data }) => data) && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No se encontraron datos de Chesta Bala para el año {selectedYear}
              </p>
              <p className="text-sm text-muted-foreground">
                Esto puede deberse a que la API no está disponible o no tiene datos para este período.
                Los datos de ejemplo se mostrarán para demostrar la funcionalidad.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Modal */}
      <Dialog open={selectedMonthForDebug !== null} onOpenChange={() => setSelectedMonthForDebug(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Estructura Completa de Datos - Mes {selectedMonthForDebug}</DialogTitle>
            <DialogDescription>
              Estructura completa de los datos devueltos por la API de Chesta Bala
            </DialogDescription>
          </DialogHeader>
          {selectedMonthForDebug && (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(
                    chestaBalaData.find(d => d.month === selectedMonthForDebug)?.data, 
                    null, 
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ChestaBala
