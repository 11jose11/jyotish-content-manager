import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Copy, FileText } from 'lucide-react'
import { usePositionsMonth } from '@/lib/api'
import { toast } from 'sonner'
import LocationAutocomplete from '@/components/LocationAutocomplete'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

interface Planet {
  name: string
  symbol: string
  color: string
}

const PLANETS: Planet[] = [
  { name: 'Sun', symbol: '☉', color: 'text-yellow-500' },
  { name: 'Moon', symbol: '☽', color: 'text-blue-500' },
  { name: 'Mercury', symbol: '☿', color: 'text-green-500' },
  { name: 'Venus', symbol: '♀', color: 'text-pink-500' },
  { name: 'Mars', symbol: '♂', color: 'text-red-500' },
  { name: 'Jupiter', symbol: '♃', color: 'text-purple-500' },
  { name: 'Saturn', symbol: '♄', color: 'text-gray-500' },
  { name: 'Rahu', symbol: '☊', color: 'text-orange-500' },
  { name: 'Ketu', symbol: '☋', color: 'text-indigo-500' },
]

const NAKSHATRA_ABBR: Record<string, string> = {
  'Aśvinī': 'Aśv',
  'Bharaṇī': 'Bhar',
  'Kṛttikā': 'Kṛt',
  'Rohiṇī': 'Roh',
  'Mṛgaśira': 'Mṛg',
  'Ārdrā': 'Ārd',
  'Punarvasu': 'Pun',
  'Puṣya': 'Puṣ',
  'Āśleṣā': 'Āśl',
  'Maghā': 'Mag',
  'Pūrva Phalgunī': 'P.Ph',
  'Uttara Phalgunī': 'U.Ph',
  'Hasta': 'Has',
  'Citrā': 'Cit',
  'Svātī': 'Svā',
  'Viśākhā': 'Viś',
  'Anurādhā': 'Anu',
  'Jyeṣṭhā': 'Jye',
  'Mūla': 'Mūl',
  'Pūrva Āṣāḍhā': 'P.Āṣ',
  'Uttara Āṣāḍhā': 'U.Āṣ',
  'Śravaṇa': 'Śra',
  'Dhaniṣṭhā': 'Dha',
  'Śatabhiṣā': 'Śat',
  'Pūrva Bhādrapadā': 'P.Bh',
  'Uttara Bhādrapadā': 'U.Bh',
  'Revatī': 'Rev',
}

const Transits: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
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
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: ''
  })
  const [template, setTemplate] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly')

  const { data: positionsData, isLoading, error } = usePositionsMonth({
    year: selectedYear,
    month: selectedMonth,
    latitude: location.latitude,
    longitude: location.longitude,
  })

  const getPlanetPosition = (planet: Planet, dateStr: string) => {
    if (!positionsData?.planets) return null
    
    const planetData = positionsData.planets.find((p: any) => p.name === planet.name)
    if (!planetData?.days) return null
    
    const dayData = planetData.days.find((d: any) => d.date === dateStr)
    return dayData?.position || null
  }

  const getTransitionInfo = (planet: Planet, dateStr: string) => {
    if (!positionsData?.transitions) return null
    
    return positionsData.transitions.find((t: any) =>
      t.planet === planet.name && t.date === dateStr
    )
  }

  const getRelevantTransitions = () => {
    if (!positionsData?.transitions) return []
    
    const relevantTransitions = positionsData.transitions.filter((t: any) =>
      selectedPlanets.includes(t.planet) &&
      (!dateRange.from || t.date >= dateRange.from) &&
      (!dateRange.to || t.date <= dateRange.to)
    )
    
    return relevantTransitions
  }

  const generatePrompt = () => {
    const transitions = getRelevantTransitions()
    const changesCount = transitions.length
    
    // Group by planet and nakshatra for ranges
    const ranges: Record<string, any[]> = {}
    transitions.forEach((t: any) => {
      const key = `${t.planet}-${t.toNakshatra.nameIAST}-p${t.toNakshatra.pada}`
      if (!ranges[key]) ranges[key] = []
      ranges[key].push(t)
    })
    
    const rangesCount = Object.keys(ranges).length
    
    const changesList = transitions.map((t: any) => 
      `${t.planet} ${t.date} ${t.time} → ${t.toNakshatra.nameIAST} p${t.toNakshatra.pada}`
    ).join('\n')
    
    const rangesTable = Object.entries(ranges).map(([, ts]) => {
      const first = ts[0]
      const last = ts[ts.length - 1]
      return `${first.planet} — ${first.toNakshatra.nameIAST} p${first.toNakshatra.pada} (${first.date} ${first.time}) → ${last.toNakshatra.nameIAST} p${last.toNakshatra.pada} (${last.date} ${last.time})`
    }).join('\n')
    
    const prompt = `# REPORTE ${template.toUpperCase()} — ${dateRange.from || 'INICIO'} → ${dateRange.to || 'FIN'}
Lugar: ${location.city} (${location.latitude},${location.longitude})
TZ: ${location.timezone}
Ayanāṁśa: True Citra Paksha (Lahiri)
Planetas: ${selectedPlanets.join(', ')}
• Cambios detectados (nakṣatra/pāda): ${changesCount}
${changesList}
• Rangos continuos por planeta: ${rangesCount}
${rangesTable}

Instrucciones de estilo: escribe análisis claro, inspirador, para público general; evita tecnicismos, destaca hitos (ingresos de nakṣatra) y recomienda acciones.`
    
    return prompt
  }

  const handleCopyPrompt = () => {
    const prompt = generatePrompt()
    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copiado al portapapeles')
  }

  const handleSavePrompt = () => {
    const prompt = generatePrompt()
    const blob = new Blob([prompt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transits-prompt-${selectedYear}-${selectedMonth}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Prompt guardado como archivo')
  }

  const renderCalendar = () => {
    if (!positionsData?.days) return null
    
    const days = positionsData.days
    const weeks = []
    
    for (let i = 0; i < days.length; i += 7) {
      const week = days.slice(i, i + 7)
      weeks.push(week)
    }
    
    return (
      <div className="grid gap-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day: any, dayIndex: number) => (
              <Card key={dayIndex} className="p-1">
                <div className="text-center text-xs font-medium mb-1">
                  {new Date(day.date).getDate()}
                </div>
                <div className="space-y-0.5">
                  {PLANETS.map((planet) => {
                    const position = getPlanetPosition(planet, day.date)
                    const transition = getTransitionInfo(planet, day.date)
                    
                    if (!position) return null
                    
                    const nakshatraAbbr = NAKSHATRA_ABBR[position.nakshatra.nameIAST] || position.nakshatra.nameIAST
                    
                    return (
                      <div key={planet.name} className="text-xs">
                        <span className={planet.color}>
                          {planet.symbol}
                        </span>
                        <span className="ml-1">
                          {nakshatraAbbr} p{position.nakshatra.pada}
                        </span>
                        {transition && (
                          <Badge variant="destructive" className="ml-1 text-xs">
                            →
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>
        ))}
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
              No se pudieron cargar los datos de posiciones planetarias.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🌙 Calendario de Tránsitos</h1>
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
            Posiciones planetarias y cambios de nakshatra
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

      {/* Prompt Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Report Prompt Builder v2</CardTitle>
          <CardDescription>
            Genera prompts para reportes de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={template} onValueChange={(value) => setTemplate(value as any)}>
            <TabsList>
              <TabsTrigger value="daily">Diario</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensual</TabsTrigger>
              <TabsTrigger value="custom">Rango Personalizado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label>Planetas</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {PLANETS.map((planet) => (
                <div key={planet.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={planet.name}
                    checked={selectedPlanets.includes(planet.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPlanets(prev => [...prev, planet.name])
                      } else {
                        setSelectedPlanets(prev => prev.filter(p => p !== planet.name))
                      }
                    }}
                  />
                  <Label htmlFor={planet.name} className="text-sm">
                    <span className={planet.color}>{planet.symbol}</span> {planet.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Prompt Generado</Label>
            <Textarea
              value={generatePrompt()}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

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
    </div>
  )
}

export default Transits

