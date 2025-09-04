import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
// Funciones síncronas para enriquecer datos básicos
const getNakshatraTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Aśvinī': 'La Primera Favorable',
    'Bharaṇī': 'La Portadora',
    'Kṛttikā': 'Las Cortadoras',
    'Rohiṇī': 'La Roja',
    'Mṛgaśirā': 'La Cabeza del Ciervo',
    'Ārdrā': 'La Húmeda',
    'Punarvasu': 'El Retorno de la Luz',
    'Puṣya': 'El Nutritivo',
    'Āśleṣā': 'El Abrazo',
    'Maghā': 'La Poderosa',
    'Pūrvaphalgunī': 'La Primera Favorable',
    'Uttaraphalgunī': 'La Segunda Favorable',
    'Hasta': 'La Mano',
    'Citrā': 'La Brillante',
    'Svātī': 'El Independiente',
    'Viśākhā': 'La Ramificada',
    'Anurādhā': 'La Seguida',
    'Jyeṣṭhā': 'La Mayor',
    'Mūla': 'La Raíz',
    'Pūrvāṣāḍhā': 'La Primera Invicta',
    'Uttarāṣāḍhā': 'La Segunda Invicta',
    'Śravaṇa': 'El Oído',
    'Dhaniṣṭhā': 'La Rica',
    'Śatabhiṣā': 'Los Cien Curanderos',
    'Pūrvabhādrapadā': 'La Primera Favorable',
    'Uttarabhādrapadā': 'La Segunda Favorable',
    'Revatī': 'La Rica'
  }
  return translations[name] || 'Constelación lunar'
}

const getNakshatraDeity = (name: string): string => {
  const deities: Record<string, string> = {
    'Aśvinī': 'Aśvinī Kumaras',
    'Bharaṇī': 'Yama',
    'Kṛttikā': 'Agni',
    'Rohiṇī': 'Brahmā',
    'Mṛgaśirā': 'Soma',
    'Ārdrā': 'Rudra',
    'Punarvasu': 'Aditi',
    'Puṣya': 'Bṛhaspati',
    'Āśleṣā': 'Nāgas',
    'Maghā': 'Pitṛs',
    'Pūrvaphalgunī': 'Bhaga',
    'Uttaraphalgunī': 'Aryaman',
    'Hasta': 'Savitṛ',
    'Citrā': 'Tvaṣṭṛ',
    'Svātī': 'Vāyu',
    'Viśākhā': 'Indrāgni',
    'Anurādhā': 'Mitra',
    'Jyeṣṭhā': 'Indra',
    'Mūla': 'Nirṛti',
    'Pūrvāṣāḍhā': 'Āpas',
    'Uttarāṣāḍhā': 'Viśve Devas',
    'Śravaṇa': 'Viṣṇu',
    'Dhaniṣṭhā': 'Vasu',
    'Śatabhiṣā': 'Varuṇa',
    'Pūrvabhādrapadā': 'Aja Ekapāda',
    'Uttarabhādrapadā': 'Ahir Budhnya',
    'Revatī': 'Pūṣan'
  }
  return deities[name] || 'Deidad lunar'
}

const getNakshatraClassification = (name: string): string => {
  const classifications: Record<string, string> = {
    'Aśvinī': 'Mṛdu (Suave)',
    'Bharaṇī': 'Ugra (Feroz)',
    'Kṛttikā': 'Ugra (Feroz)',
    'Rohiṇī': 'Mṛdu (Suave)',
    'Mṛgaśirā': 'Mṛdu (Suave)',
    'Ārdrā': 'Ugra (Feroz)',
    'Punarvasu': 'Mṛdu (Suave)',
    'Puṣya': 'Mṛdu (Suave)',
    'Āśleṣā': 'Ugra (Feroz)',
    'Maghā': 'Ugra (Feroz)',
    'Pūrvaphalgunī': 'Mṛdu (Suave)',
    'Uttaraphalgunī': 'Mṛdu (Suave)',
    'Hasta': 'Mṛdu (Suave)',
    'Citrā': 'Mṛdu (Suave)',
    'Svātī': 'Mṛdu (Suave)',
    'Viśākhā': 'Ugra (Feroz)',
    'Anurādhā': 'Mṛdu (Suave)',
    'Jyeṣṭhā': 'Ugra (Feroz)',
    'Mūla': 'Ugra (Feroz)',
    'Pūrvāṣāḍhā': 'Ugra (Feroz)',
    'Uttarāṣāḍhā': 'Mṛdu (Suave)',
    'Śravaṇa': 'Mṛdu (Suave)',
    'Dhaniṣṭhā': 'Ugra (Feroz)',
    'Śatabhiṣā': 'Ugra (Feroz)',
    'Pūrvabhādrapadā': 'Ugra (Feroz)',
    'Uttarabhādrapadā': 'Mṛdu (Suave)',
    'Revatī': 'Mṛdu (Suave)'
  }
  return classifications[name] || 'Clasificación lunar'
}

const getNakshatraRecommendations = (): string => {
  return 'Favorables: actividades relacionadas con la naturaleza de la constelación. Desfavorables: actividades contrarias a su energía.'
}

const getTithiTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Pratipada': 'Primer día lunar',
    'Dvitiya': 'Segundo día lunar',
    'Tritiya': 'Tercer día lunar',
    'Chaturthi': 'Cuarto día lunar',
    'Panchami': 'Quinto día lunar',
    'Shashthi': 'Sexto día lunar',
    'Saptami': 'Séptimo día lunar',
    'Ashtami': 'Octavo día lunar',
    'Navami': 'Noveno día lunar',
    'Dashami': 'Décimo día lunar',
    'Ekadashi': 'Undécimo día lunar',
    'Dwadashi': 'Duodécimo día lunar',
    'Trayodashi': 'Decimotercer día lunar',
    'Chaturdashi': 'Decimocuarto día lunar',
    'Purnima': 'Luna llena',
    'Amavasya': 'Luna nueva'
  }
  return translations[name] || 'Día lunar'
}

const getTithiElement = (name: string): string => {
  const elements: Record<string, string> = {
    'Pratipada': 'Agua',
    'Dvitiya': 'Agua',
    'Tritiya': 'Agua',
    'Chaturthi': 'Agua',
    'Panchami': 'Agua',
    'Shashthi': 'Agua',
    'Saptami': 'Agua',
    'Ashtami': 'Agua',
    'Navami': 'Agua',
    'Dashami': 'Agua',
    'Ekadashi': 'Agua',
    'Dwadashi': 'Agua',
    'Trayodashi': 'Agua',
    'Chaturdashi': 'Agua',
    'Purnima': 'Agua',
    'Amavasya': 'Agua'
  }
  return elements[name] || 'Elemento lunar'
}

const getTithiRecommendations = (): string => {
  return 'Favorables: actividades según la fase lunar. Desfavorables: actividades contrarias al período lunar.'
}

const getKaranaTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Bava': 'Nacimiento',
    'Bālava': 'Fuerza',
    'Kaulava': 'Familia',
    'Taitila': 'Sesamo',
    'Garija': 'Montaña',
    'Vanija': 'Comercio',
    'Viṣṭi': 'Servicio',
    'Śakuni': 'Pájaro',
    'Catuṣpāda': 'Cuatro patas',
    'Nāga': 'Serpiente',
    'Kiṃstughna': 'Pequeño'
  }
  return translations[name] || 'Mitad de tithi'
}

const getKaranaDeity = (name: string): string => {
  const deities: Record<string, string> = {
    'Bava': 'Indra',
    'Bālava': 'Brahmā',
    'Kaulava': 'Indra',
    'Taitila': 'Agni',
    'Garija': 'Indra',
    'Vanija': 'Brahmā',
    'Viṣṭi': 'Yama',
    'Śakuni': 'Agni',
    'Catuṣpāda': 'Brahmā',
    'Nāga': 'Indra',
    'Kiṃstughna': 'Agni'
  }
  return deities[name] || 'Deidad del karana'
}

const getKaranaRecommendations = (): string => {
  return 'Favorables: actividades según la naturaleza del karana. Desfavorables: actividades contrarias a su energía.'
}

const getVaraTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Sunday': 'Domingo',
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado'
  }
  return translations[name] || 'Día de la semana'
}

const getVaraPlanet = (name: string): string => {
  const planets: Record<string, string> = {
    'Sunday': 'Sol',
    'Monday': 'Luna',
    'Tuesday': 'Marte',
    'Wednesday': 'Mercurio',
    'Thursday': 'Júpiter',
    'Friday': 'Venus',
    'Saturday': 'Saturno'
  }
  return planets[name] || 'Planeta regente'
}

const getVaraRecommendations = (): string => {
  return 'Favorables: actividades relacionadas con el planeta regente. Desfavorables: actividades contrarias a su energía.'
}

const getYogaTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Vishkumbha': 'Pilar de Aire',
    'Priti': 'Afecto',
    'Ayushman': 'Longevidad',
    'Saubhagya': 'Buena fortuna',
    'Shobhana': 'Hermoso',
    'Atiganda': 'Gran obstáculo',
    'Sukarman': 'Buen trabajo',
    'Dhriti': 'Firmeza',
    'Shula': 'Lanza',
    'Ganda': 'Nudo',
    'Vriddhi': 'Crecimiento',
    'Dhruva': 'Fijo',
    'Vyaghata': 'Colisión',
    'Harshana': 'Alegría',
    'Vajra': 'Rayo',
    'Siddhi': 'Perfección',
    'Vyatipata': 'Calamidad',
    'Variyan': 'Agua',
    'Parigha': 'Barrera',
    'Shiva': 'Auspicioso',
    'Siddha': 'Perfeccionado',
    'Sadhya': 'Realizable',
    'Shubha': 'Auspicioso',
    'Shukla': 'Blanco',
    'Brahma': 'Creador',
    'Indra': 'Rey de los dioses',
    'Vaidhriti': 'Separación'
  }
  return translations[name] || 'Combinación solar-lunar'
}

const getYogaType = (): string => {
  return 'Yoga solar-lunar'
}

const getYogaRecommendations = (): string => {
  return 'Favorables: actividades según la naturaleza del yoga. Desfavorables: actividades contrarias a su energía.'
}

interface PanchangaElement {
  name: string
  nameIAST?: string
  translation?: string
  classification?: string
  recommendations?: string
  deity?: string
  element?: string
  type?: string
  planet?: string
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
  // Condiciones de formación
  vara?: string
  tithi_group?: string
  tithi_number?: number
  nakshatra?: string
  classification?: string
  sun_longitude?: number
  moon_longitude?: number
  distance_nakshatra?: number
  beneficial?: string
  avoid?: string[]
  recommended?: string[]
  color?: string
  priority?: number
}

interface PanchangaDetailPanelProps {
  date: string
  panchanga: {
    nakshatra?: PanchangaElement
    tithi?: PanchangaElement
    karana?: PanchangaElement
    vara?: PanchangaElement
    yoga?: PanchangaElement
    specialYogas?: SpecialYogaElement[]
  }
  isOpen: boolean
  onClose: () => void
}

const PanchangaDetailPanel: React.FC<PanchangaDetailPanelProps> = ({
  date,
  panchanga,
  isOpen,
  onClose
}) => {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [enrichedPanchanga, setEnrichedPanchanga] = useState<any>(null)

  // Función para enriquecer los datos básicos de la API con información detallada
  const enrichPanchangaData = (basicData: any) => {
    console.log('🔍 enrichPanchangaData called with:', basicData)
    
    if (!basicData) {
      console.log('❌ basicData is null or undefined')
      return null
    }

    // Log de los nombres que vienen de la API
    console.log('🔍 Nombres de la API:', {
      nakshatra: basicData.nakshatra?.name,
      tithi: basicData.tithi?.name,
      karana: basicData.karana?.name,
      vara: basicData.vara?.name,
      yoga: basicData.yoga?.name
    })

    // Crear datos enriquecidos usando información básica de la API
    const enriched = {
      nakshatra: basicData.nakshatra?.name ? {
        name: basicData.nakshatra.name,
        nameIAST: basicData.nakshatra.name,
        translation: getNakshatraTranslation(basicData.nakshatra.name),
        deity: getNakshatraDeity(basicData.nakshatra.name),
        classification: getNakshatraClassification(basicData.nakshatra.name),
        recommendations: getNakshatraRecommendations()
      } : null,
      tithi: basicData.tithi?.name ? {
        name: basicData.tithi.name,
        nameIAST: basicData.tithi.name,
        translation: getTithiTranslation(basicData.tithi.name),
        element: getTithiElement(basicData.tithi.name),
        recommendations: getTithiRecommendations()
      } : null,
      karana: basicData.karana?.name ? {
        name: basicData.karana.name,
        nameIAST: basicData.karana.name,
        translation: getKaranaTranslation(basicData.karana.name),
        deity: getKaranaDeity(basicData.karana.name),
        recommendations: getKaranaRecommendations()
      } : null,
      vara: basicData.vara?.name ? {
        name: basicData.vara.name,
        nameIAST: basicData.vara.name,
        translation: getVaraTranslation(basicData.vara.name),
        planet: getVaraPlanet(basicData.vara.name),
        recommendations: getVaraRecommendations()
      } : null,
      yoga: basicData.yoga?.name ? {
        name: basicData.yoga.name,
        nameIAST: basicData.yoga.name,
        translation: getYogaTranslation(basicData.yoga.name),
        type: getYogaType(),
        recommendations: getYogaRecommendations()
      } : null,
      specialYogas: basicData.specialYogas || []
    }
    
    // Log de los resultados de enriquecimiento
    console.log('🔍 Resultados de enriquecimiento:', {
      nakshatra: enriched.nakshatra,
      tithi: enriched.tithi,
      karana: enriched.karana,
      vara: enriched.vara,
      yoga: enriched.yoga
    })
    
    console.log('✅ Enriched data:', enriched)
    return enriched
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { isOpen, panchanga })
    
    if (isOpen && panchanga) {
      console.log('📊 Processing panchanga data:', panchanga)
      
      // Enriquecer los datos básicos de la API
      const enriched = enrichPanchangaData(panchanga)
      console.log('📈 Setting enriched panchanga:', enriched)
      setEnrichedPanchanga(enriched)
      
      // Log temporal para diagnosticar yogas
      if (enriched && enriched.specialYogas && enriched.specialYogas.length > 0) {
        console.log('🔍 Yogas especiales detectados:', enriched.specialYogas)
        enriched.specialYogas.forEach((yoga: any, index: number) => {
          console.log(`Yoga ${index + 1}:`, {
            name: yoga.name,
            polarity: yoga.polarity,
            avoid: yoga.avoid,
            beneficial: yoga.beneficial,
            recommended: yoga.recommended,
            avoid_activities: yoga.avoid_activities,
            beneficial_activities: yoga.beneficial_activities
          })
        })
      }
      
      // Generar prompt con datos enriquecidos
      if (enriched) {
        generatePrompt(enriched)
      }
    } else {
      console.log('❌ Conditions not met:', { isOpen, panchanga })
    }
  }, [isOpen, panchanga])

  const generatePrompt = (data = enrichedPanchanga) => {
    if (!data) return
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    console.log('📝 Generating prompt with data:', data)

    const prompt = `Fecha: ${formatDate(date)}

🪐 Pañcāṅga del día

Nakṣatra: ${data.nakshatra?.nameIAST || data.nakshatra?.name || 'No disponible'} (${data.nakshatra?.deity || 'deidad'}, clasificación ${data.nakshatra?.classification || 'tipo'})
→ Recomendaciones: ${data.nakshatra?.recommendations || 'Sin recomendaciones específicas'}

Tithi: ${data.tithi?.nameIAST || data.tithi?.name || 'No disponible'} (${data.tithi?.element || 'grupo'}, elemento asociado)
→ Recomendaciones: ${data.tithi?.recommendations || 'Sin recomendaciones específicas'}

Karaṇa: ${data.karana?.nameIAST || data.karana?.name || 'No disponible'} (${data.karana?.deity || 'devata/regente'})
→ Recomendaciones: ${data.karana?.recommendations || 'Sin recomendaciones específicas'}

Vara: ${data.vara?.nameIAST || data.vara?.name || 'No disponible'} (regente: ${data.vara?.planet || 'planeta'})
→ Recomendaciones: ${data.vara?.recommendations || 'Sin recomendaciones específicas'}

Yoga: ${data.yoga?.nameIAST || data.yoga?.name || 'No disponible'} (${data.yoga?.type || 'tipo'})
→ Recomendaciones: ${data.yoga?.recommendations || 'Sin recomendaciones específicas'}

Yogas Especiales: ${data.specialYogas && data.specialYogas.length > 0 
  ? data.specialYogas.map((yoga: any) => {
      const polarity = yoga.polarity === 'positive' ? '🟢' : '🔴'
      const name = yoga.name_sanskrit || yoga.name || 'No disponible'
      const type = yoga.type || 'tipo'
      const description = yoga.detailed_description || 'Sin descripción detallada'
      
      // Condiciones de formación
      const conditions = []
      if (yoga.vara) conditions.push(`Vara: ${yoga.vara}`)
      if (yoga.tithi_group) conditions.push(`Grupo Tithi: ${yoga.tithi_group}`)
      if (yoga.tithi_number) conditions.push(`Tithi: ${yoga.tithi_number}`)
      if (yoga.nakshatra) conditions.push(`Nakshatra: ${yoga.nakshatra}`)
      if (yoga.classification) conditions.push(`Clasificación: ${yoga.classification}`)
      if (yoga.distance_nakshatra) conditions.push(`Distancia: ${yoga.distance_nakshatra} nakshatras`)
      
      const conditionsText = conditions.length > 0 
        ? `\n  • Condiciones: ${conditions.join(', ')}`
        : ''
      
      // Actividades beneficiosas - usar recommended o beneficial
      const beneficial = []
      if (yoga.beneficial) beneficial.push(yoga.beneficial)
      if (yoga.recommended && yoga.recommended.length > 0) beneficial.push(...yoga.recommended)
      const beneficialText = beneficial.length > 0 
        ? `\n  • Actividades beneficiosas: ${beneficial.join(', ')}`
        : ''
      
      // Actividades a evitar - usar avoid
      const avoid = yoga.avoid && yoga.avoid.length > 0 
        ? `\n  • Evitar: ${yoga.avoid.join(', ')}`
        : ''
      return `${polarity} ${name} (${type}): ${description}${conditionsText}${beneficialText}${avoid}`
    }).join('\n\n')
  : 'No hay yogas especiales detectados'
}

Instrucciones para el reporte:
Genera un reporte narrativo de 90 segundos basado en los elementos del pañcāṅga de este día. Incluye:
1. Análisis general del día basado en los elementos presentes
2. **ATENCIÓN ESPECIAL A YOGAS ESPECIALES**: Si hay yogas especiales detectados, dedica una sección específica a explicar su significado, las condiciones astrológicas que los forman, y su impacto en las actividades del día
3. Recomendaciones específicas para actividades favorables (priorizando las de los yogas especiales si existen)
4. Advertencias sobre actividades desfavorables (especialmente las mencionadas en yogas especiales negativos)
5. Consejos prácticos para aprovechar las energías del día
6. Conclusión con el tono general del día
7. Cita algún verso célebre motivador que vaya con la energía del día (puede ser de textos védicos, Bhagavad Gita, Upanishads, o sabiduría tradicional)

**IMPORTANTE**: Si hay yogas especiales presentes, estos deben ser el foco principal del reporte, ya que representan combinaciones astrológicas únicas y poderosas que influyen significativamente en el día.

El reporte debe ser claro, práctico y útil para la toma de decisiones diarias. Usa un tono inspirador y accesible, como un paṇḍita jyotiṣī compartiendo sabiduría ancestral.`

    setGeneratedPrompt(prompt)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
    toast.success('Prompt copiado al portapapeles')
  }

  const handleSavePrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `panchanga-prompt-${date}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Prompt guardado como archivo')
  }

  if (!isOpen) return null
  
  // Mostrar loading si no hay datos enriquecidos aún
  if (!enrichedPanchanga) {
    return (
      <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando detalles del panchanga...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">
                🌙 Pañcāṅga Detallado
              </CardTitle>
              <CardDescription className="text-lg font-medium">
                {formatDate(date)}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-primary"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Nakshatra */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Nakṣatra
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.nakshatra?.nameIAST || enrichedPanchanga.nakshatra?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.nakshatra?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Deidad:</span> {enrichedPanchanga.nakshatra?.deity || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Clasificación:</span> {enrichedPanchanga.nakshatra?.classification || 'No disponible'}
              </p>
              {enrichedPanchanga.nakshatra?.recommendations && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-blue-700">{enrichedPanchanga.nakshatra.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tithi */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Tithi
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.tithi?.nameIAST || enrichedPanchanga.tithi?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.tithi?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Elemento:</span> {enrichedPanchanga.tithi?.element || 'No disponible'}
              </p>
              {enrichedPanchanga.tithi?.recommendations && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-green-700">{enrichedPanchanga.tithi.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Karana */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Karaṇa
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.karana?.nameIAST || enrichedPanchanga.karana?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.karana?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Deidad:</span> {enrichedPanchanga.karana?.deity || 'No disponible'}
              </p>
              {enrichedPanchanga.karana?.recommendations && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-purple-700">{enrichedPanchanga.karana.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vara */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Vara
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.vara?.nameIAST || enrichedPanchanga.vara?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.vara?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Planeta regente:</span> {enrichedPanchanga.vara?.planet || 'No disponible'}
              </p>
              {enrichedPanchanga.vara?.recommendations && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-orange-700">{enrichedPanchanga.vara.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Yoga */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Yoga
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.yoga?.nameIAST || enrichedPanchanga.yoga?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.yoga?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tipo:</span> {enrichedPanchanga.yoga?.type || 'No disponible'}
              </p>
              {enrichedPanchanga.yoga?.recommendations && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-indigo-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-indigo-700">{enrichedPanchanga.yoga.recommendations}</p>
                </div>
              )}
            </div>
          </div>

                     {/* Yogas Especiales */}
           {enrichedPanchanga.specialYogas && enrichedPanchanga.specialYogas.length > 0 && (
             <>
               <Separator />
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <Badge variant="outline" className="text-sm font-medium">
                     Yogas Especiales
                   </Badge>
                 </div>
                 <div className="ml-4 space-y-4">
                                       {enrichedPanchanga.specialYogas.map((yoga: any, index: number) => (
                     <div key={index} className="space-y-2">
                       <h4 className="text-md font-semibold">
                         {yoga.name_sanskrit || yoga.name || 'No disponible'}
                       </h4>
                       <div className="space-y-1">
                         <p className="text-sm text-muted-foreground">
                           <span className="font-medium">Tipo:</span> {yoga.type || 'No disponible'}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           <span className="font-medium">Polaridad:</span> {yoga.polarity || 'No disponible'}
                         </p>
                         {yoga.priority && (
                           <p className="text-sm text-muted-foreground">
                             <span className="font-medium">Prioridad:</span> {yoga.priority}
                           </p>
                         )}
                         
                         {/* Condiciones de Formación */}
                         <div className="bg-slate-50 p-3 rounded-lg mt-2">
                           <p className="text-sm font-medium text-slate-800 mb-2">🔍 Condiciones de Formación:</p>
                           <div className="space-y-1 text-xs text-slate-700">
                             {yoga.vara && (
                               <p><span className="font-medium">Vara (día):</span> {yoga.vara}</p>
                             )}
                             {yoga.tithi_group && (
                               <p><span className="font-medium">Grupo de Tithi:</span> {yoga.tithi_group}</p>
                             )}
                             {yoga.tithi_number && (
                               <p><span className="font-medium">Número de Tithi:</span> {yoga.tithi_number}</p>
                             )}
                             {yoga.nakshatra && (
                               <p><span className="font-medium">Nakshatra:</span> {yoga.nakshatra}</p>
                             )}
                             {yoga.classification && (
                               <p><span className="font-medium">Clasificación:</span> {yoga.classification}</p>
                             )}
                             {yoga.distance_nakshatra && (
                               <p><span className="font-medium">Distancia por Nakshatra:</span> {yoga.distance_nakshatra}</p>
                             )}
                             {yoga.sun_longitude && yoga.moon_longitude && (
                               <div>
                                 <p><span className="font-medium">Longitud Solar:</span> {yoga.sun_longitude.toFixed(2)}°</p>
                                 <p><span className="font-medium">Longitud Lunar:</span> {yoga.moon_longitude.toFixed(2)}°</p>
                               </div>
                             )}
                           </div>
                         </div>
                         {yoga.detailed_description && (
                           <div className={`p-3 rounded-lg ${
                             yoga.polarity === 'positive' ? 'bg-green-50' : 'bg-red-50'
                           }`}>
                             <p className={`text-sm font-medium ${
                               yoga.polarity === 'positive' ? 'text-green-800' : 'text-red-800'
                             }`}>💡 Descripción:</p>
                             <p className={`text-sm ${
                               yoga.polarity === 'positive' ? 'text-green-700' : 'text-red-700'
                             }`}>{yoga.detailed_description}</p>
                           </div>
                         )}
                         {/* Actividades Beneficiosas - usar recommended o beneficial */}
                         {((yoga.recommended && yoga.recommended.length > 0) || yoga.beneficial) && (
                           <div className="bg-blue-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-blue-800">✅ Actividades Beneficiosas:</p>
                             {yoga.beneficial && (
                               <p className="text-sm text-blue-700 mb-2">{yoga.beneficial}</p>
                             )}
                             {yoga.recommended && yoga.recommended.length > 0 && (
                               <ul className="text-sm text-blue-700 list-disc list-inside">
                                                                   {yoga.recommended.map((activity: any, i: number) => (
                                   <li key={i}>{activity}</li>
                                 ))}
                               </ul>
                             )}
                           </div>
                         )}
                         {/* Actividades a Evitar - usar avoid */}
                         {yoga.avoid && yoga.avoid.length > 0 && (
                           <div className="bg-orange-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-orange-800">⚠️ Evitar:</p>
                             <ul className="text-sm text-orange-700 list-disc list-inside">
                                                               {yoga.avoid.map((activity: any, i: number) => (
                                 <li key={i}>{activity}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                         {yoga.notes && (
                           <div className="bg-gray-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-gray-800">📝 Notas:</p>
                             <p className="text-sm text-gray-700">{yoga.notes}</p>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </>
           )}

          {/* AI Prompt Generator */}
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Generar Reporte Diario con IA</h3>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Prompt generado automáticamente con toda la información del pañcāṅga:
              </p>
              <div className="bg-background p-3 rounded border max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {generatedPrompt}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopyPrompt} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copiar Prompt
              </Button>
              <Button onClick={handleSavePrompt} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Guardar .txt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PanchangaDetailPanel
