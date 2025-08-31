import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

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

  useEffect(() => {
    console.log('🎯 PanchangaDetailPanel useEffect triggered:', { isOpen, panchanga })
    if (isOpen && panchanga) {
      console.log('📝 Generating prompt with panchanga data:', panchanga)
      generatePrompt()
    }
  }, [isOpen, panchanga])

  const generatePrompt = () => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    console.log('📝 Generating prompt with data:', panchanga)

    const prompt = `Fecha: ${formatDate(date)}

🪐 Pañcāṅga del día

Nakṣatra: ${panchanga.nakshatra?.nameIAST || panchanga.nakshatra?.name || 'No disponible'} (${panchanga.nakshatra?.deity || 'deidad'}, clasificación ${panchanga.nakshatra?.classification || 'tipo'})
→ Recomendaciones: ${panchanga.nakshatra?.recommendations || 'Sin recomendaciones específicas'}

Tithi: ${panchanga.tithi?.nameIAST || panchanga.tithi?.name || 'No disponible'} (${panchanga.tithi?.element || 'grupo'}, elemento asociado)
→ Recomendaciones: ${panchanga.tithi?.recommendations || 'Sin recomendaciones específicas'}

Karaṇa: ${panchanga.karana?.nameIAST || panchanga.karana?.name || 'No disponible'} (${panchanga.karana?.deity || 'devata/regente'})
→ Recomendaciones: ${panchanga.karana?.recommendations || 'Sin recomendaciones específicas'}

Vara: ${panchanga.vara?.nameIAST || panchanga.vara?.name || 'No disponible'} (regente: ${panchanga.vara?.planet || 'planeta'})
→ Recomendaciones: ${panchanga.vara?.recommendations || 'Sin recomendaciones específicas'}

Yoga: ${panchanga.yoga?.nameIAST || panchanga.yoga?.name || 'No disponible'} (${panchanga.yoga?.type || 'tipo'})
→ Recomendaciones: ${panchanga.yoga?.recommendations || 'Sin recomendaciones específicas'}

Yoga especial: ${panchanga.specialYogas && panchanga.specialYogas.length > 0 
  ? panchanga.specialYogas.map(yoga => 
      `${yoga.name_sanskrit || yoga.name || 'No disponible'} (${yoga.type || 'tipo'})`
    ).join(', ')
  : 'No hay yogas especiales'
}
→ Recomendaciones: ${panchanga.specialYogas && panchanga.specialYogas.length > 0 
  ? panchanga.specialYogas.map(yoga => yoga.detailed_description || 'Sin recomendaciones').join('; ')
  : 'Sin recomendaciones específicas'
}

Instrucciones para el reporte:
Genera un reporte narrativo de 90 segundos basado en los elementos del pañcāṅga de este día. Incluye:
1. Análisis general del día basado en los elementos presentes
2. Recomendaciones específicas para actividades favorables
3. Advertencias sobre actividades desfavorables
4. Consejos prácticos para aprovechar las energías del día
5. Conclusión con el tono general del día
6. Cita algún verso célebre motivador que vaya con la energía del día (puede ser de textos védicos, Bhagavad Gita, Upanishads, o sabiduría tradicional)

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
          {/* Debug Info - Temporary */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">🔍 Debug Info:</h4>
            <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
              {JSON.stringify(panchanga, null, 2)}
            </pre>
          </div>
          {/* Nakshatra */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Nakṣatra
              </Badge>
              <h3 className="text-lg font-semibold">
                {panchanga.nakshatra?.nameIAST || panchanga.nakshatra?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {panchanga.nakshatra?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Deidad:</span> {panchanga.nakshatra?.deity || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Clasificación:</span> {panchanga.nakshatra?.classification || 'No disponible'}
              </p>
              {panchanga.nakshatra?.recommendations && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-blue-700">{panchanga.nakshatra.recommendations}</p>
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
                {panchanga.tithi?.nameIAST || panchanga.tithi?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {panchanga.tithi?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Elemento:</span> {panchanga.tithi?.element || 'No disponible'}
              </p>
              {panchanga.tithi?.recommendations && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-green-700">{panchanga.tithi.recommendations}</p>
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
                {panchanga.karana?.nameIAST || panchanga.karana?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {panchanga.karana?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Deidad:</span> {panchanga.karana?.deity || 'No disponible'}
              </p>
              {panchanga.karana?.recommendations && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-purple-700">{panchanga.karana.recommendations}</p>
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
                {panchanga.vara?.nameIAST || panchanga.vara?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {panchanga.vara?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Planeta regente:</span> {panchanga.vara?.planet || 'No disponible'}
              </p>
              {panchanga.vara?.recommendations && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-orange-700">{panchanga.vara.recommendations}</p>
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
                {panchanga.yoga?.nameIAST || panchanga.yoga?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {panchanga.yoga?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tipo:</span> {panchanga.yoga?.type || 'No disponible'}
              </p>
              {panchanga.yoga?.recommendations && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-indigo-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-indigo-700">{panchanga.yoga.recommendations}</p>
                </div>
              )}
            </div>
          </div>

                     {/* Yogas Especiales */}
           {panchanga.specialYogas && panchanga.specialYogas.length > 0 && (
             <>
               <Separator />
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <Badge variant="outline" className="text-sm font-medium">
                     Yogas Especiales
                   </Badge>
                 </div>
                 <div className="ml-4 space-y-4">
                   {panchanga.specialYogas.map((yoga, index) => (
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
                         {yoga.beneficial_activities && yoga.beneficial_activities.length > 0 && (
                           <div className="bg-blue-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-blue-800">✅ Actividades Beneficiosas:</p>
                             <ul className="text-sm text-blue-700 list-disc list-inside">
                               {yoga.beneficial_activities.map((activity, i) => (
                                 <li key={i}>{activity}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                         {yoga.avoid_activities && yoga.avoid_activities.length > 0 && (
                           <div className="bg-orange-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-orange-800">⚠️ Evitar:</p>
                             <ul className="text-sm text-orange-700 list-disc list-inside">
                               {yoga.avoid_activities.map((activity, i) => (
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
