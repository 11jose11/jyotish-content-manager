import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useEclipseSeasons, useEclipseLegend, useEclipseCheck } from '@/lib/api'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import { 
  Calendar, 
  MapPin, 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Eye,
  BookOpen,
  User,
  ChevronRight,
  Sun,
  Moon,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

interface EclipseSeason {
  id: string
  startDate: string
  endDate: string
  startRashi: string
  startNakshatra: string
  startNakshatraPada: number
  verdict: 'Bhoga' | 'Mokṣa' | 'Neutral'
  order: number
  ayana: 'Uttarayana' | 'Dakshinayana'
  drgDirection: string
  rule87: number
  mainPair: {
    start: string
    end: string
    duration: number
  }
  events: EclipseEvent[]
}

interface EclipseEvent {
  id: string
  date: string
  type: 'Solar' | 'Lunar'
  sunRashi: string
  sunNakshatra: string
  sunNakshatraPada: number
  moonRashi: string
  moonNakshatra: string
  moonNakshatraPada: number
  jupiter: string
  visibility: string[]
  isVisibleInCountry: boolean
  affects18Years: boolean
}

interface EclipseMatch {
  planet: string
  rashi: string
  nakshatra: string
  severity: 'High' | 'Medium' | 'Low'
  benefit: boolean
  loss: boolean
  prePost: string | null
  window18Years: string
}

const EclipseDashboard: React.FC = () => {
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
  const [countryISO, setCountryISO] = useState('IN')
  const [showLegend, setShowLegend] = useState(false)
  const [natalPoints, setNatalPoints] = useState({
    sunRashi: '',
    sunNakshatra: '',
    sunLongitude: '',
    moonRashi: '',
    moonNakshatra: '',
    moonLongitude: '',
    marsRashi: '',
    marsNakshatra: '',
    marsLongitude: ''
  })

  // API hooks
  const { data: seasonsData, isLoading: seasonsLoading, error: seasonsError } = useEclipseSeasons({
    year: selectedYear,
    latitude: location.latitude,
    longitude: location.longitude,
    countryISO
  })

  const { data: legendData, isLoading: legendLoading } = useEclipseLegend()
  
  const { data: chartData, mutate: checkChart } = useEclipseCheck()

  // URL synchronization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const year = params.get('year')
    const lat = params.get('lat')
    const lon = params.get('lon')
    const country = params.get('country')
    
    if (year) setSelectedYear(parseInt(year))
    if (lat && lon) {
      setLocation(prev => ({
        ...prev,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      }))
    }
    if (country) setCountryISO(country)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('year', selectedYear.toString())
    params.set('lat', location.latitude.toString())
    params.set('lon', location.longitude.toString())
    params.set('country', countryISO)
    
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [selectedYear, location, countryISO])

  const handleLoadSeasons = () => {
    toast.success('Cargando temporadas de eclipses...')
  }

  const handleCheckChart = () => {
    if (!natalPoints.sunRashi || !natalPoints.moonRashi) {
      toast.error('Por favor, completa al menos el Sol y la Luna')
      return
    }
    
    checkChart({
      natalPoints,
      year: selectedYear,
      latitude: location.latitude,
      longitude: location.longitude
    })
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Bhoga': return 'bg-green-100 text-green-800'
      case 'Mokṣa': return 'bg-purple-100 text-purple-800'
      case 'Neutral': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Bhoga': return <TrendingUp className="h-4 w-4" />
      case 'Mokṣa': return <TrendingDown className="h-4 w-4" />
      case 'Neutral': return <Activity className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatDate = (dateStr: string, showLocal = true) => {
    const date = new Date(dateStr)
    if (showLocal) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    return date.toISOString()
  }

  const getKPIs = () => {
    if (!seasonsData?.seasons) return { totalEclipses: 0, totalSeasons: 0, seasonsWith3Events: 0 }
    
    const seasons = seasonsData.seasons
    const totalEclipses = seasons.reduce((sum: number, season: EclipseSeason) => sum + season.events.length, 0)
    const totalSeasons = seasons.length
    const seasonsWith3Events = seasons.filter((season: EclipseSeason) => season.events.length >= 3).length
    
    return { totalEclipses, totalSeasons, seasonsWith3Events }
  }

  const kpis = getKPIs()

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">🌑 Dashboard de Eclipses</h1>
          <p className="text-muted-foreground">
            Análisis de temporadas de eclipses y su impacto astrológico
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Año</label>
              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
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
              <label className="text-sm font-medium mb-2 block">País (ISO)</label>
              <Input
                value={countryISO}
                onChange={(e) => setCountryISO(e.target.value.toUpperCase())}
                placeholder="IN, US, ES..."
                maxLength={2}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleLoadSeasons} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Cargar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Eclipses</p>
                <p className="text-2xl font-bold">{kpis.totalEclipses}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temporadas</p>
                <p className="text-2xl font-bold">{kpis.totalSeasons}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Con 3+ Eventos</p>
                <p className="text-2xl font-bold">{kpis.seasonsWith3Events}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="seasons" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="seasons">Temporadas</TabsTrigger>
            <TabsTrigger value="chart">Tu Carta</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Drawer open={showLegend} onOpenChange={setShowLegend}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Leyenda
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Leyenda de Eclipses</DrawerTitle>
                  <DrawerDescription>
                    Información sobre la interpretación de eclipses
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  {legendLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ) : (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: legendData?.content || 'No hay contenido disponible' }}
                    />
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        <TabsContent value="seasons" className="space-y-6">
          {/* Loading State */}
          {seasonsLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                  <span>Cargando temporadas de eclipses...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {seasonsError && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-500">
                  <p>Error al cargar las temporadas de eclipses</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verifica tu conexión y los parámetros de búsqueda
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seasons Cards */}
          {seasonsData?.seasons && (
            <div className="space-y-6">
              {seasonsData.seasons.map((season: EclipseSeason) => (
                <Card key={season.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getVerdictColor(season.verdict)} text-lg px-4 py-2`}>
                          {getVerdictIcon(season.verdict)}
                          <span className="ml-2">{season.verdict}</span>
                        </Badge>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          Orden {season.order}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Temporada {season.id}</p>
                        <p>{formatDate(season.startDate)} - {formatDate(season.endDate)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Season Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Comienza en</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Sol:</strong> {season.startRashi} - {season.startNakshatra} {season.startNakshatraPada}</p>
                          <p><strong>Luna:</strong> {season.startRashi} - {season.startNakshatra} {season.startNakshatraPada}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Características</h4>
                        <div className="space-y-1">
                          <Badge variant="secondary">{season.ayana}</Badge>
                          <Badge variant="secondary">{season.drgDirection}</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Regla 8.7</h4>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {season.rule87}
                        </Badge>
                      </div>
                    </div>

                    {/* Main Pair */}
                    <div>
                      <h4 className="font-medium mb-2">Par Principal (≤15d)</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{formatDate(season.mainPair.start)}</span>
                        <ChevronRight className="h-4 w-4" />
                        <span>{formatDate(season.mainPair.end)}</span>
                        <Badge variant="outline">
                          {season.mainPair.duration}d
                        </Badge>
                      </div>
                    </div>

                    {/* Events Table */}
                    <div>
                      <h4 className="font-medium mb-3">Eventos de Eclipse</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Fecha</th>
                              <th className="text-left p-2">Tipo</th>
                              <th className="text-left p-2">Sol</th>
                              <th className="text-left p-2">Luna</th>
                              <th className="text-left p-2">Júpiter</th>
                              <th className="text-left p-2">Visibilidad</th>
                              <th className="text-left p-2">18 años</th>
                            </tr>
                          </thead>
                          <tbody>
                            {season.events.map((event: EclipseEvent) => (
                              <tr key={event.id} className="border-b">
                                <td className="p-2">
                                  <div>
                                    <div>{formatDate(event.date)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      UTC: {formatDate(event.date, false)}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2">
                                  <Badge variant={event.type === 'Solar' ? 'default' : 'secondary'}>
                                    {event.type === 'Solar' ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                                    {event.type}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  {event.sunRashi} - {event.sunNakshatra} {event.sunNakshatraPada}
                                </td>
                                <td className="p-2">
                                  {event.moonRashi} - {event.moonNakshatra} {event.moonNakshatraPada}
                                </td>
                                <td className="p-2">{event.jupiter}</td>
                                <td className="p-2">
                                  <div className="flex flex-wrap gap-1">
                                    {event.visibility.slice(0, 2).map((country, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {country}
                                      </Badge>
                                    ))}
                                    {event.visibility.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{event.visibility.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                  {event.isVisibleInCountry && (
                                    <Badge variant="default" className="text-xs mt-1">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Visible aquí
                                    </Badge>
                                  )}
                                </td>
                                <td className="p-2">
                                  {event.affects18Years ? (
                                    <Badge variant="destructive" className="text-xs">
                                      Sí
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      No
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Data State */}
          {!seasonsLoading && !seasonsError && (!seasonsData?.seasons || seasonsData.seasons.length === 0) && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    No se encontraron temporadas de eclipses para el año {selectedYear}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Intenta con un año diferente o verifica los parámetros de búsqueda.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tu Carta Natal
              </CardTitle>
              <CardDescription>
                Ingresa tus puntos natales para analizar el impacto de los eclipses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Natal Points Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sol</label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Rashi"
                      value={natalPoints.sunRashi}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, sunRashi: e.target.value }))}
                    />
                    <Input
                      placeholder="Nakshatra"
                      value={natalPoints.sunNakshatra}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, sunNakshatra: e.target.value }))}
                    />
                    <Input
                      placeholder="Longitud (opcional)"
                      value={natalPoints.sunLongitude}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, sunLongitude: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Luna</label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Rashi"
                      value={natalPoints.moonRashi}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, moonRashi: e.target.value }))}
                    />
                    <Input
                      placeholder="Nakshatra"
                      value={natalPoints.moonNakshatra}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, moonNakshatra: e.target.value }))}
                    />
                    <Input
                      placeholder="Longitud (opcional)"
                      value={natalPoints.moonLongitude}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, moonLongitude: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Marte</label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Rashi"
                      value={natalPoints.marsRashi}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, marsRashi: e.target.value }))}
                    />
                    <Input
                      placeholder="Nakshatra"
                      value={natalPoints.marsNakshatra}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, marsNakshatra: e.target.value }))}
                    />
                    <Input
                      placeholder="Longitud (opcional)"
                      value={natalPoints.marsLongitude}
                      onChange={(e) => setNatalPoints(prev => ({ ...prev, marsLongitude: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleCheckChart} className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Evaluar Impacto
              </Button>

              {/* Chart Results */}
              {chartData?.matches && (
                <div className="space-y-4">
                  <h4 className="font-medium">Matches Encontrados</h4>
                  <div className="space-y-3">
                    {chartData.matches.map((match: EclipseMatch, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{match.planet}</Badge>
                            <Badge variant="secondary">{match.rashi}</Badge>
                            <Badge variant="secondary">{match.nakshatra}</Badge>
                          </div>
                          <Badge 
                            variant={match.severity === 'High' ? 'destructive' : match.severity === 'Medium' ? 'default' : 'secondary'}
                          >
                            {match.severity}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            {match.benefit && <Badge variant="default" className="bg-green-100 text-green-800">Beneficio</Badge>}
                            {match.loss && <Badge variant="destructive">Pérdida</Badge>}
                          </div>
                          
                          {match.prePost && (
                            <Badge variant="outline">
                              {match.prePost}
                            </Badge>
                          )}
                          
                          <div className="text-muted-foreground">
                            Ventana 18 años: {match.window18Years}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EclipseDashboard
