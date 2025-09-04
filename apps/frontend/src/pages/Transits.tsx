import React, { useState, useEffect } from 'react'
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
import { useCalendarMonth, useChestaBalaMonthly, useChestaBalaDaily } from '@/lib/api'
import { toast } from 'sonner'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import ChestaBalaPanel from '@/components/ChestaBalaPanel'
import ChestaBalaDailyPanel from '@/components/ChestaBalaDailyPanel'

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
  const [template, setTemplate] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('monthly')
  
  // Calculate date range based on template
  const getDateRange = () => {
    const today = new Date()
    const year = selectedYear
    const month = selectedMonth
    
    switch (template) {
      case 'daily':
        const todayStr = today.toISOString().split('T')[0]
        return { from: todayStr, to: todayStr }
      
      case 'weekly':
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        return {
          from: startOfWeek.toISOString().split('T')[0],
          to: endOfWeek.toISOString().split('T')[0]
        }
      
      case 'monthly':
        const monthStart = new Date(year, month - 1, 1)
        const monthEnd = new Date(year, month, 0)
        return {
          from: monthStart.toISOString().split('T')[0],
          to: monthEnd.toISOString().split('T')[0]
        }
      
      case 'custom':
        return { from: '', to: '' }
      
      default:
        return { from: '', to: '' }
    }
  }
  
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(getDateRange())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Update date range when template changes
  useEffect(() => {
    if (template !== 'custom') {
      setDateRange(getDateRange())
    }
  }, [template, selectedYear, selectedMonth])

  const { data: calendarData, isLoading, error } = useCalendarMonth({
    year: selectedYear,
    month: selectedMonth,
    latitude: location.latitude,
    longitude: location.longitude,
  })

  // Chesta Bala hooks
  const { data: chestaBalaMonthly, isLoading: chestaBalaLoading } = useChestaBalaMonthly({
    year: selectedYear,
    month: selectedMonth,
    latitude: location.latitude,
    longitude: location.longitude,
    planets: selectedPlanets
  })

  const { data: chestaBalaDaily, isLoading: chestaBalaDailyLoading } = useChestaBalaDaily({
    date: selectedDate || new Date().toISOString().split('T')[0],
    latitude: location.latitude,
    longitude: location.longitude,
    planets: selectedPlanets
  })

  const getPlanetPosition = (planet: Planet, dateStr: string) => {
    if (!calendarData?.days) return null
    
    const dayData = calendarData.days.find((d: any) => d.date === dateStr)
    if (!dayData?.planets) return null
    
    const planetData = dayData.planets.find((p: any) => p.name === planet.name)
    return planetData?.nakshatra || null
  }

  const getTransitionInfo = (planet: Planet, dateStr: string) => {
    if (!calendarData?.transitions) return null
    
    return calendarData.transitions.find((t: any) =>
      t.planet === planet.name && t.date === dateStr
    )
  }

  const getRelevantTransitions = () => {
    if (!calendarData?.transitions) return []
    
    const relevantTransitions = calendarData.transitions.filter((t: any) =>
      selectedPlanets.includes(t.planet) &&
      (!dateRange.from || t.date >= dateRange.from) &&
      (!dateRange.to || t.date <= dateRange.to)
    )
    
    return relevantTransitions
  }

  // Helper functions for nakshatra data
  const getFavorableActivities = (nakshatra: string, pada: number): string[] => {
    const nakshatraData: Record<string, Record<number, string[]>> = {
      'Aśvinī': {
        1: ['inicios', 'nuevos proyectos', 'energía', 'liderazgo'],
        2: ['construcción', 'organización', 'estructura'],
        3: ['comunicación', 'intercambio', 'colaboración'],
        4: ['conclusión', 'entrega', 'evaluación']
      },
      'Bharaṇī': {
        1: ['crecimiento', 'expansión', 'abundancia'],
        2: ['estabilidad', 'persistencia', 'resistencia'],
        3: ['transformación', 'renovación', 'cambio'],
        4: ['purificación', 'limpieza', 'liberación']
      },
      'Kṛttikā': {
        1: ['acción', 'coraje', 'determinación'],
        2: ['construcción', 'fundamentos', 'base sólida'],
        3: ['liderazgo', 'autoridad', 'responsabilidad'],
        4: ['purificación', 'disciplina', 'orden']
      },
      'Rohiṇī': {
        1: ['crecimiento', 'fertilidad', 'abundancia'],
        2: ['estabilidad', 'persistencia', 'constancia'],
        3: ['belleza', 'arte', 'creatividad'],
        4: ['satisfacción', 'plenitud', 'completitud']
      },
      'Mṛgaśira': {
        1: ['exploración', 'búsqueda', 'curiosidad'],
        2: ['investigación', 'análisis', 'estudio'],
        3: ['comunicación', 'expresión', 'arte'],
        4: ['conclusión', 'síntesis', 'integración']
      }
    }
    
    return nakshatraData[nakshatra]?.[pada] || ['actividades generales', 'desarrollo personal']
  }

  const getUnfavorableActivities = (nakshatra: string, pada: number): string[] => {
    const nakshatraData: Record<string, Record<number, string[]>> = {
      'Aśvinī': {
        1: ['impaciencia', 'prisa excesiva', 'agresividad'],
        2: ['rigidez', 'inflexibilidad', 'obstinación'],
        3: ['conflicto', 'competencia excesiva', 'egoísmo'],
        4: ['perfeccionismo', 'crítica excesiva', 'intolerancia']
      },
      'Bharaṇī': {
        1: ['acumulación excesiva', 'materialismo', 'avaricia'],
        2: ['estancamiento', 'resistencia al cambio', 'pasividad'],
        3: ['transformación forzada', 'cambio abrupto', 'inestabilidad'],
        4: ['purificación excesiva', 'rigidez', 'intolerancia']
      },
      'Kṛttikā': {
        1: ['agresividad', 'impulsividad', 'violencia'],
        2: ['construcción forzada', 'imposición', 'autoritarismo'],
        3: ['liderazgo autoritario', 'dominación', 'control excesivo'],
        4: ['purificación excesiva', 'disciplina rígida', 'intolerancia']
      },
      'Rohiṇī': {
        1: ['acumulación excesiva', 'materialismo', 'apego'],
        2: ['estancamiento', 'resistencia al cambio', 'pasividad'],
        3: ['belleza superficial', 'vanidad', 'superficialidad'],
        4: ['satisfacción excesiva', 'complacencia', 'estancamiento']
      },
      'Mṛgaśira': {
        1: ['exploración excesiva', 'dispersión', 'falta de enfoque'],
        2: ['análisis excesivo', 'parálisis por análisis', 'indecisión'],
        3: ['comunicación excesiva', 'chismes', 'superficialidad'],
        4: ['conclusión prematura', 'síntesis forzada', 'rigidez']
      }
    }
    
    return nakshatraData[nakshatra]?.[pada] || ['actividades conflictivas', 'evitar confrontaciones']
  }


  const generatePrompt = () => {
    // Get date range
    const startDate = dateRange.from || new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0]
    const endDate = dateRange.to || new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]
    
    // Generate planet movement ranges from calendar data
    const generatePlanetRanges = () => {
      if (!calendarData?.days) return []
      
      const planetRanges: any[] = []
      
      selectedPlanets.forEach(planetName => {
        const planetDays = calendarData.days
          .filter((day: any) => {
            const dayDate = day.date
            return dayDate >= startDate && dayDate <= endDate
          })
          .map((day: any) => {
            const planetData = day.planets?.find((p: any) => p.name === planetName)
            if (!planetData) return null
            
            return {
              date: day.date,
              nakshatra: planetData.nakshatra?.nameIAST || planetData.nakshatra?.name || 'Unknown',
              pada: planetData.nakshatra?.pada || 1,
              retrograde: planetData.retrograde || false,
              longitude: planetData.longitude || 0
            }
          })
          .filter(Boolean)
        
        // Group consecutive days with same nakshatra/pada
        let currentRange: any = null
        const ranges: any[] = []
        
        planetDays.forEach((dayData: any) => {
          const key = `${dayData.nakshatra}-${dayData.pada}`
          
          if (!currentRange || currentRange.key !== key) {
            if (currentRange) {
              ranges.push(currentRange)
            }
            currentRange = {
              planet: planetName,
              nakshatra: dayData.nakshatra,
              pada: dayData.pada,
              retrograde: dayData.retrograde,
              startDate: dayData.date,
              endDate: dayData.date,
              key: key,
              favorables: getFavorableActivities(dayData.nakshatra, dayData.pada),
              desfavorables: getUnfavorableActivities(dayData.nakshatra, dayData.pada),
              motionState: dayData.motionState || 'sama',
              chestaBala: dayData.chestaBala || 30
            }
          } else {
            currentRange.endDate = dayData.date
          }
        })
        
        if (currentRange) {
          ranges.push(currentRange)
        }
        
        planetRanges.push(...ranges)
      })
      
      return planetRanges
    }
    
    const planetRanges = generatePlanetRanges()
    const transitions = getRelevantTransitions()
    
    // Create changes list
    const cambios = transitions.map((t: any) => ({
      planeta: t.planet,
      de_sector: t.fromNakshatra?.nameIAST || t.fromNakshatra?.name || 'Unknown',
      de_subsector: t.fromNakshatra?.pada || 1,
      a_sector: t.toNakshatra?.nameIAST || t.toNakshatra?.name || 'Unknown',
      a_subsector: t.toNakshatra?.pada || 1,
      hora_local: `${t.date} ${t.time || '00:00'}`
    }))
    
    // Generate Chesta Bala changes data
    const generateChestaBalaChanges = () => {
      if (!chestaBalaMonthly?.summary?.changes_by_planet) return ''
      
      const changes = chestaBalaMonthly.summary.changes_by_planet
      const changesText = Object.entries(changes).map(([planet, planetChanges]: [string, any]) => {
        const planetName = planet === 'Sun' ? 'Sol' : 
                          planet === 'Moon' ? 'Luna' :
                          planet === 'Mars' ? 'Marte' :
                          planet === 'Mercury' ? 'Mercurio' :
                          planet === 'Jupiter' ? 'Júpiter' :
                          planet === 'Venus' ? 'Venus' :
                          planet === 'Saturn' ? 'Saturno' :
                          planet === 'Rahu' ? 'Rahu' :
                          planet === 'Ketu' ? 'Ketu' : planet
        
        const changesList = planetChanges.map((change: any) => {
          const fromState = change.from_state || 'unknown'
          const toState = change.to_state || 'unknown'
          const date = new Date(change.date).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit' 
          })
          return `  • ${date}: ${fromState} → ${toState} (Chesta Bala: ${change.chesta_bala_change})`
        }).join('\n')
        
        return `PLANETA: ${planetName}\n${changesList}`
      }).join('\n\n')
      
      return changesText
    }

    const prompt = `# RANGOS DE MOVIMIENTO PLANETARIO
PERÍODO: ${startDate} → ${endDate} (TZ: ${location.timezone})

${planetRanges.map(range => `PLANETA: ${range.planet}
• ${range.startDate} → ${range.endDate} — Nakshatra: ${range.nakshatra} | Pada: ${range.pada} | Ceṣṭā Bala: ${range.motionState} (${range.chestaBala})${range.retrograde ? ' | Retrógrado' : ''}
`).join('\n')}

# CAMBIOS DE MOVIMIENTO POR PLANETA
PERÍODO: ${startDate} → ${endDate} (TZ: ${location.timezone})

${generateChestaBalaChanges()}

# CAMBIOS DE NAKSHATRA/PADA
${cambios.map((cambio: any) => `• ${cambio.planeta} cambia de ${cambio.de_sector}/${cambio.de_subsector} a ${cambio.a_sector}/${cambio.a_subsector} en ${cambio.hora_local}`).join('\n')}

# CONTEXTO (NO IMPRIMIR)
PERÍODO: ${startDate} → ${endDate} (TZ: ${location.timezone})
PLANETAS: con tramos de tránsito (nakshatra, pada, favorables/desfavorables, retrogradaciones, combustiones, categoría de cestabala).
CAMBIOS: lista de cambios de nakshatra/pada con hora local.

# LENTES POR PLANETA (NO IMPRIMIR)
Sol → identidad, dirección, autoridad, propósito.
Luna → ánimo, fluctuaciones, cuidado personal, hogar.
Marte → acción, coraje, urgencias, conflictos.
Mercurio → mente, comunicación, comercio, análisis.
Júpiter → crecimiento, oportunidades, sentido, mentores.
Venus → vínculos, arte, placer, negociación, estética.
Saturno → estructura, tiempo, límites, responsabilidades.
Nodo Norte → ambición, innovación, exposición, riesgo.
Nodo Sur → depuración, desapego, cierre, espiritualidad.

# MAPA PADA (NO IMPRIMIR)
1 = arranque | 2 = construcción | 3 = intercambio | 4 = cierre

# MAPA DE CESTABALA (NO IMPRIMIR)
Vakra (retrogrado) → muy fuerte, deseo máximo, doble filo.  
Anuvakra → reactivación tras pausa, frutos tras obstáculos.  
Vikala (estacionario) → bloqueo, parálisis, confusión.  
Mandatara (muy lento) → pesado, obstrucción.  
Manda (lento) → estable pero tardío.  
Sama (medio) → balanceado, normal.  
Chara (rápido) → dinámico, logros inmediatos, algo inestable.  
Atichara (muy rápido) → gran impulso, logros acelerados, riesgo de exceso.  
Kutilaka (irregular) → contradictorio, zigzagueante, ambiguo, difícil de predecir.

# MOTOR DE MEZCLA (OBLIGATORIO — NO IMPRIMIR)
1) Nombrar con claridad el tránsito usando las fechas del período: "El Sol transita Purva Phalguni del 1 al 13 de septiembre". No inventar rangos: usar solo los del bloque CONTEXTO.  
2) Fusionar en cada tránsito:
   - Planeta (lente: qué canaliza).  
   - Nakshatra (cualidades: el color del tránsito).  
   - Pada (dinámica: arranque / construcción / intercambio / cierre).  
   - Cestabala (intensidad/velocidad/bloqueo o doble filo).
3) Desarrollar cada tránsito en tres capas:  
   - Astrológica/externa (qué se mueve).  
   - Psicológica/interna (cómo se siente).  
   - Motivadora/estoica (qué hacer y cómo sostener virtud, disciplina y calma).
4) Incorporar favorables/desfavorables como recomendaciones prácticas concretas.  
5) Seleccionar 5–6 tránsitos principales del mes (los más largos, intensos o transformadores). No enumerar los 9 planetas en bloque.  
6) Mencionar cambios de nakshatra o pada como "ventanas" o "giros de energía" con hora local si está disponible.  
7) Coherencia y equilibrio: si hay redundancias, fusionar ideas; si hay contradicciones, integrarlas con una salida práctica ("avanza con preparación", "modera el ritmo sin detener el plan").

# INSTRUCCIONES (PÚBLICAS — AUDIO ~15 MIN)
- Genera un guion de AUDIO en **español natural y 100% legible por ElevenLabs** (sin diacríticos ni caracteres raros).  
  - Si un nombre tradicional trae diacríticos/transliteración (ā, ṛ, ṣ, etc.), **convertir a forma legible**: Ashwini, Mrigashira, Shukra, etc.
- Extensión: **2000–2500 palabras** (~15 minutos).  
- Tono: mezcla de **pandit erudito**, **psicólogo motivador** y **filósofo estoico**.  
- **Inicio**: nombra el período completo → "Este mes va del ${startDate} al ${endDate}…".  
- **Panorama general del mes**: describe el clima global, oportunidades y retos.  
- **Tránsitos clave (5–6)**:  
  - Nombrarlos claramente con nakshatra y fechas.  
  - Explicar el blend planeta × nakshatra × pada × cestabala.  
  - Dedicar 2–3 minutos por tránsito con:
    1. Explicación astrológica (qué implica).  
    2. Reflexión psicológica (cómo se vive por dentro y en vínculos).  
    3. Consejo motivador (acciones concretas, prioridades).  
    4. Mirada estoica (aceptación, virtud, disciplina, foco en lo controlable).
- **Ventanas de cambio**: destacar cuando un planeta cambia de nakshatra o de pada durante el mes, como momentos propicios para ajustar rumbo.  
- **Consejos prácticos del mes**: resume 4–5 acciones recomendadas (en narrativa, sin listas crudas).  
- **Advertencias**: 2–3 precauciones con alternativa positiva ("si no se puede A, intenta B").  
- **Cierre**:
  - Recapitula el tono del mes.  
  - Incluye una **frase motivadora original** (1–2 líneas), filosófica y inspiradora, **no** una cita famosa.  
- Estilo de audio: frases claras, pausas naturales, conectores suaves ("ademas", "por eso", "asi que"), ritmo conversado y cercano (más peruano que españolizado).  
- Temporalidad: enfoca **todo en el mes** (evita "hoy/mañana").  
- Salida: un **único texto fluido**, listo para TTS, **sin usar "sector/subsector"** en ningún momento.

# CONTROLES DE CALIDAD (NO IMPRIMIR)
- No inventar datos ni fechas. Usa solo los tramos del CONTEXTO.  
- Nombra nakshatras y padas tal como vengan del CONTEXTO (normalizados a español legible).  
- Evita repeticiones y muletillas; usa sinónimos y transiciones variadas.  
- Mantén coherencia entre ceñstabala y el tono de las recomendaciones (p. ej., Vakra = fuerte pero doble filo; Vikala = bloqueo/pausa).  
- Conserva un balance entre erudición, empatía práctica y quietud estoica.`
    
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
    if (!calendarData?.days) return null
    
    const days = calendarData.days
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
              <Card 
                key={dayIndex} 
                className={`p-1 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedDate === day.date ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="text-center text-xs font-medium mb-1">
                  {new Date(day.date).getDate()}
                </div>
                <div className="space-y-0.5">
                  {PLANETS.map((planet) => {
                    const position = getPlanetPosition(planet, day.date)
                    const transition = getTransitionInfo(planet, day.date)
                    
                    if (!position) return null
                    
                    const nakshatraName = position.nameIAST || position.name || 'Unknown'
                    const nakshatraAbbr = NAKSHATRA_ABBR[nakshatraName] || nakshatraName
                    
                    return (
                      <div key={planet.name} className="text-xs">
                        <span className={planet.color}>
                          {planet.symbol}
                        </span>
                        <span className="ml-1">
                          {nakshatraAbbr} p{position.pada || 1}
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
            <p className="text-sm text-muted-foreground mt-2">
              Error: {error.message}
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

      {/* Chesta Bala Monthly Analysis */}
      {chestaBalaMonthly && (
        <ChestaBalaPanel 
          summary={chestaBalaMonthly.summary} 
          isLoading={chestaBalaLoading}
        />
      )}

      {/* Chesta Bala Daily Analysis */}
      {selectedDate && chestaBalaDaily && (
        <ChestaBalaDailyPanel 
          planets={chestaBalaDaily.planets} 
          date={selectedDate}
          isLoading={chestaBalaDailyLoading}
        />
      )}

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

          {/* Debug Panel - Temporary */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">🔍 Debug Info</h3>
            <div className="text-sm space-y-1">
              <div><strong>Template:</strong> {template}</div>
              <div><strong>Date Range:</strong> {dateRange.from} → {dateRange.to}</div>
              <div><strong>Selected Planets:</strong> {selectedPlanets.join(', ')}</div>
              <div><strong>Calendar Data:</strong> {calendarData ? '✅ Loaded' : '❌ Not loaded'}</div>
              <div><strong>Calendar Days:</strong> {calendarData?.days?.length || 0} days</div>
              <div><strong>Transitions:</strong> {calendarData?.transitions?.length || 0} found</div>
              <div><strong>Relevant Transitions:</strong> {getRelevantTransitions().length} filtered</div>
              <div><strong>Planet Ranges Generated:</strong> {(() => {
                const ranges = generatePrompt().split('PLANETA:').length - 1
                return ranges
              })()} ranges</div>
              {calendarData?.days && calendarData.days.length > 0 && (
                <div><strong>Sample Day:</strong> {JSON.stringify(calendarData.days[0], null, 2)}</div>
              )}
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

