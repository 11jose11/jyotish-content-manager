import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Sparkles, Star, Moon, Zap, Calendar, X, CheckCircle, XCircle, Bot, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { panchangaSimplifiedService } from '@/lib/panchangaSimplifiedService'
import { AIReportGeneratorV2 } from '@/lib/aiReportGeneratorV2'

interface PanchangaDetailPanelProps {
  date: string
  panchanga: any
  isOpen: boolean
  onClose: () => void
}

const PanchangaDetailPanel: React.FC<PanchangaDetailPanelProps> = ({
  date,
  panchanga,
  isOpen,
  onClose
}) => {
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [generatingPrompt, setGeneratingPrompt] = useState(false)

  // Validar que panchanga sea un objeto válido
  if (!panchanga || typeof panchanga !== 'object') {
    console.error('PanchangaDetailPanel: Invalid panchanga object:', panchanga)
      return null
  }

  useEffect(() => {
    if (isOpen && panchanga) {
      loadRecommendations()
    }
  }, [isOpen, panchanga])

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      console.log('🔄 Loading recommendations for:', {
        tithi: panchanga.tithi?.name,
        vara: panchanga.vara?.name,
        nakshatra: panchanga.nakshatra?.name,
        yoga: panchanga.yoga?.name,
        karana: panchanga.karana?.name,
        specialYogas: panchanga.specialYogas || panchanga.special_yogas || []
      })
      console.log('🔍 Full panchanga object:', panchanga)
      console.log('🔍 Nakshatra object:', panchanga.nakshatra)
      
      const recs = await panchangaSimplifiedService.getDayRecommendations({
        tithi: panchanga.tithi,
        vara: panchanga.vara,
        nakshatra: panchanga.nakshatra,
        yoga: panchanga.yoga,
        karana: panchanga.karana,
        specialYogas: panchanga.specialYogas || panchanga.special_yogas || []
      })
      
      console.log('📊 Recommendations loaded:', recs)
      setRecommendations(recs)
        } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const text = `Panchanga para ${new Date(date).toLocaleDateString('es-ES')}
    
Tithi: ${panchanga.tithi?.name || 'N/A'}
Vara: ${panchanga.vara?.name || 'N/A'}
Nakshatra: ${panchanga.nakshatra?.name || 'N/A'}
Yoga: ${panchanga.yoga?.name || 'N/A'}
Karana: ${panchanga.karana?.name || 'N/A'}

${panchanga.specialYogas && panchanga.specialYogas.length > 0 ? 
  `Yogas Especiales: ${panchanga.specialYogas.map((y: any) => y.name || y.type).join(', ')}` : 
  'Sin yogas especiales'
}`
    
    navigator.clipboard.writeText(text)
    toast.success('Información copiada al portapapeles')
  }

  const generateAIPrompt = async () => {
    setGeneratingPrompt(true)
    try {
      console.log('🤖 Generando prompt de IA para:', date)
      const prompt = await AIReportGeneratorV2.generateDailyReportPrompt({
        date,
        tithi: panchanga.tithi,
        vara: panchanga.vara,
        nakshatra: panchanga.nakshatra,
        yoga: panchanga.yoga,
        karana: panchanga.karana,
        specialYogas: panchanga.specialYogas || []
      })
      setAiPrompt(prompt)
    } catch (error) {
      console.error('Error generating AI prompt:', error)
      toast.error('Error generando prompt de IA')
    } finally {
      setGeneratingPrompt(false)
    }
  }

  const copyAIPromptToClipboard = () => {
    navigator.clipboard.writeText(aiPrompt)
    toast.success('Prompt copiado al portapapeles')
  }

  if (!isOpen) return null
  
    return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Calendar className="h-6 w-6" />
              Panchanga Completo - {new Date(date).toLocaleDateString('es-ES')}
              </CardTitle>
            <CardDescription className="text-blue-700">
              Análisis detallado del día con recomendaciones basadas en la astrología védica
              </CardDescription>
            </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando recomendaciones...</span>
            </div>
        ) : (
          <div className="space-y-6">
            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar Info
              </Button>
              <Button 
                onClick={generateAIPrompt} 
                disabled={generatingPrompt}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Bot className="h-4 w-4 mr-2" />
                {generatingPrompt ? 'Generando...' : 'Generar Prompt IA'}
              </Button>
          </div>

            {/* 1. TITHI */}
            {panchanga.tithi && recommendations?.tithi && (
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Moon className="h-5 w-5" />
                    1. TITHI - {recommendations?.tithi?.name || 'No disponible'}
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {recommendations?.tithi?.translation || 'N/A'} | Deidad: {recommendations?.tithi?.deity || 'N/A'} | Elemento: {recommendations?.tithi?.element || 'N/A'}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations?.tithi?.classification || 'N/A'}
              </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations?.tithi?.description && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-2">Descripción:</p>
                      <p>{recommendations.tithi.description}</p>
                </div>
              )}
                  {recommendations?.tithi?.favorables && recommendations.tithi.favorables.length > 0 && (
                    <div>
                      <p className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Actividades Favorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.tithi.favorables.map((activity: string, index: number) => (
                          <li key={index} className="text-green-600">{activity}</li>
                        ))}
                      </ul>
                </div>
              )}
                  {recommendations?.tithi?.desfavorables && recommendations.tithi.desfavorables.length > 0 && (
                    <div>
                      <p className="font-medium text-red-700 mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Actividades Desfavorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.tithi.desfavorables.map((activity: string, index: number) => (
                          <li key={index} className="text-red-600">{activity}</li>
                        ))}
                      </ul>
                </div>
              )}
                </CardContent>
              </Card>
            )}

            {/* 2. NAKSHATRA */}
            {panchanga.nakshatra && recommendations?.nakshatra && (
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Star className="h-5 w-5" />
                    2. NAKSHATRA - {recommendations?.nakshatra?.name || 'No disponible'}
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    {recommendations?.nakshatra?.translation || 'N/A'} | Deidad: {recommendations?.nakshatra?.deity || 'N/A'} | Planeta: {recommendations?.nakshatra?.planet || 'N/A'}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="w-fit">
                      {recommendations?.nakshatra?.classification || 'N/A'}
                    </Badge>
                    {recommendations?.nakshatra?.yogatara && (
                      <Badge variant="secondary" className="w-fit">
                        Yogatara: {recommendations.nakshatra.yogatara}
                      </Badge>
                    )}
                    {recommendations?.nakshatra?.direction && (
                      <Badge variant="secondary" className="w-fit">
                        {recommendations.nakshatra.direction}
                      </Badge>
                    )}
                  </div>
                  {recommendations?.nakshatra?.tree && (
                    <div className="text-sm text-green-600">
                      <strong>Árbol sagrado:</strong> {recommendations.nakshatra.tree}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations?.nakshatra?.description && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-2">Descripción:</p>
                      <p>{recommendations.nakshatra.description}</p>
                 </div>
                  )}
                  {recommendations?.nakshatra?.favorables && recommendations.nakshatra.favorables.length > 0 && (
                               <div>
                      <p className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Actividades Favorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.nakshatra.favorables.map((activity: string, index: number) => (
                          <li key={index} className="text-green-600">{activity}</li>
                                 ))}
                               </ul>
                           </div>
                         )}
                  {recommendations?.nakshatra?.desfavorables && recommendations.nakshatra.desfavorables.length > 0 && (
                    <div>
                      <p className="font-medium text-red-700 mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Actividades Desfavorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.nakshatra.desfavorables.map((activity: string, index: number) => (
                          <li key={index} className="text-red-600">{activity}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                </CardContent>
              </Card>
            )}

            {/* 3. KARANA */}
            {panchanga.karana && (
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Star className="h-5 w-5" />
                    3. KARANA - {recommendations?.karana?.name || (typeof panchanga.karana === 'string' ? panchanga.karana : panchanga.karana?.name) || 'No disponible'}
                  </CardTitle>
                  <CardDescription className="text-purple-700">
                    {recommendations?.karana?.translation || 'N/A'} | Deidad: {recommendations?.karana?.deity || 'N/A'} | Planeta: {recommendations?.karana?.planet || 'N/A'}
                    {recommendations?.karana?.mount && ` | Montura: ${recommendations.karana.mount}`}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations?.karana?.classification || 'N/A'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations?.karana?.description && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-2">Descripción:</p>
                      <p>{recommendations.karana.description}</p>
                </div>
                  )}
                  {recommendations?.karana?.favorables && recommendations.karana.favorables.length > 0 && (
                            <div>
                      <p className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Actividades Favorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.karana.favorables.map((activity: string, index: number) => (
                          <li key={index} className="text-green-600">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                  {recommendations?.karana?.desfavorables && recommendations.karana.desfavorables.length > 0 && (
                            <div>
                      <p className="font-medium text-red-700 mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Actividades Desfavorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.karana.desfavorables.map((activity: string, index: number) => (
                          <li key={index} className="text-red-600">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                  {recommendations?.karana?.recommendation && (
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <p className="font-medium text-purple-800 mb-1">Recomendación:</p>
                      <p className="text-sm text-purple-700">{recommendations.karana.recommendation}</p>
                      </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 4. VARA */}
            {panchanga.vara && recommendations?.vara && (
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Calendar className="h-5 w-5" />
                    4. VARA - {recommendations?.vara?.name || 'No disponible'}
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    {recommendations?.vara?.translation || 'N/A'} | Planeta: {recommendations?.vara?.planet || 'N/A'}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations?.vara?.classification || 'N/A'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations?.vara?.favorables && recommendations.vara.favorables.length > 0 && (
                            <div>
                      <p className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Actividades Favorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.vara.favorables.map((activity: string, index: number) => (
                          <li key={index} className="text-green-600">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                  {recommendations?.vara?.desfavorables && recommendations.vara.desfavorables.length > 0 && (
                            <div>
                      <p className="font-medium text-red-700 mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Actividades Desfavorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.vara.desfavorables.map((activity: string, index: number) => (
                          <li key={index} className="text-red-600">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                </CardContent>
              </Card>
            )}

            {/* 5. YOGA */}
            {panchanga.yoga && (
              <Card className="border-yellow-200">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Zap className="h-5 w-5" />
                    5. YOGA - {recommendations?.yoga?.name || (typeof panchanga.yoga === 'string' ? panchanga.yoga : panchanga.yoga?.name) || 'No disponible'}
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    {recommendations?.yoga?.translation || 'N/A'} | Deidad: {recommendations?.yoga?.deity || 'N/A'} | Planeta: {recommendations?.yoga?.planet || 'N/A'}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations?.yoga?.classification || 'N/A'}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations?.yoga?.detailed_description && (
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <p className="text-sm text-yellow-800">{recommendations?.yoga?.detailed_description}</p>
                    </div>
                  )}
                  {recommendations?.yoga?.favorables && recommendations.yoga.favorables.length > 0 && (
                            <div>
                      <p className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Actividades Favorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.yoga.favorables.map((activity: string, index: number) => (
                          <li key={index} className="text-green-600">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                  {recommendations?.yoga?.desfavorables && recommendations.yoga.desfavorables.length > 0 && (
                            <div>
                      <p className="font-medium text-red-700 mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Actividades Desfavorables:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.yoga.desfavorables.map((activity: string, index: number) => (
                          <li key={index} className="text-red-600">{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                </CardContent>
              </Card>
            )}

            {/* 6. YOGAS ESPECIALES */}
            {recommendations?.specialYogas && recommendations.specialYogas.length > 0 && (
              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <Sparkles className="h-5 w-5" />
                    6. YOGAS ESPECIALES ({recommendations.specialYogas.length})
                  </CardTitle>
                  <CardDescription className="text-indigo-700">
                    Yogas especiales que influyen en el día
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.specialYogas.map((specialYoga: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-indigo-800">{specialYoga?.name || `Yoga Especial ${index + 1}`}</h4>
                        <div className="flex gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              specialYoga.polarity === 'positive' ? 'bg-green-100 text-green-800 border-green-300' :
                              specialYoga.polarity === 'negative' ? 'bg-red-100 text-red-800 border-red-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}
                          >
                            {specialYoga.polarity === 'positive' ? 'Auspicioso' : 
                             specialYoga.polarity === 'negative' ? 'Inauspicioso' : 'Neutral'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Prioridad {specialYoga.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p><strong>Tipo:</strong> {specialYoga.type}</p>
                        <p><strong>Descripción:</strong> {specialYoga.description}</p>
                      </div>

                      {specialYoga.detailedDescription && (
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <p className="text-sm text-indigo-800">{specialYoga.detailedDescription}</p>
                      </div>
                    )}

                      {specialYoga.favorables && specialYoga.favorables.length > 0 && (
                            <div>
                          <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Actividades Favorables
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {specialYoga.favorables.map((activity: string, actIndex: number) => (
                              <Badge key={actIndex} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                            </div>
                          )}

                      {specialYoga.desfavorables && specialYoga.desfavorables.length > 0 && (
                            <div>
                          <h5 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            Actividades a Evitar
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {specialYoga.desfavorables.map((activity: string, actIndex: number) => (
                              <Badge key={actIndex} variant="destructive" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                            </div>
                          )}

                      {specialYoga.recommendation && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium text-blue-800 mb-1">Recomendación:</p>
                          <p className="text-sm text-blue-700">{specialYoga.recommendation}</p>
                      </div>
                    )}
                  </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Resumen del día */}
            {recommendations?.summary && (
              <Card className="border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <FileText className="h-5 w-5" />
                    Resumen del Día
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Estado General</p>
                      <p className={`text-lg font-bold ${
                        recommendations.summary.overallMood === 'auspicious' ? 'text-green-600' :
                        recommendations.summary.overallMood === 'inauspicious' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {recommendations.summary.overallMood === 'auspicious' ? 'Auspicioso' :
                         recommendations.summary.overallMood === 'inauspicious' ? 'Inauspicioso' :
                         'Neutral'}
                      </p>
                      </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Actividades Favorables</p>
                      <p className="text-lg font-bold text-green-600">
                        {recommendations.summary.favorableActivities?.length || 0}
                      </p>
                      </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Actividades a Evitar</p>
                      <p className="text-lg font-bold text-red-600">
                        {recommendations.summary.avoidActivities?.length || 0}
                      </p>
                      </div>
                      </div>
                </CardContent>
              </Card>
            )}

            {/* Información de debug */}
            <Card className="border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-sm text-gray-600">Información Técnica</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-500 space-y-1">
                <div><strong>Fecha:</strong> {date}</div>
                <div><strong>Tithi API:</strong> {typeof panchanga.tithi === 'string' ? panchanga.tithi : panchanga.tithi?.name || 'N/A'}</div>
                <div><strong>Vara API:</strong> {typeof panchanga.vara === 'string' ? panchanga.vara : panchanga.vara?.name || 'N/A'}</div>
                <div><strong>Nakshatra API:</strong> {typeof panchanga.nakshatra === 'string' ? panchanga.nakshatra : panchanga.nakshatra?.name || 'N/A'}</div>
                <div><strong>Yoga API:</strong> {typeof panchanga.yoga === 'string' ? panchanga.yoga : panchanga.yoga?.name || 'N/A'}</div>
                <div><strong>Karana API:</strong> {typeof panchanga.karana === 'string' ? panchanga.karana : panchanga.karana?.name || 'N/A'}</div>
                <div><strong>Special Yogas API:</strong> {panchanga.specialYogas?.length || 0}</div>
                <div><strong>Found Tithi:</strong> {recommendations?.tithi?.name || 'No encontrado'}</div>
                <div><strong>Found Vara:</strong> {recommendations?.vara?.name || 'No encontrado'}</div>
                <div><strong>Found Nakshatra:</strong> {recommendations?.nakshatra?.name || 'No encontrado'}</div>
                <div><strong>Found Yoga:</strong> {recommendations?.yoga?.name || 'No encontrado'}</div>
                <div><strong>Found Karana:</strong> {recommendations?.karana?.name || 'No encontrado'}</div>
                <div><strong>Found Special Yogas:</strong> {recommendations?.specialYogas?.length || 0}</div>
              </CardContent>
            </Card>

            {/* Prompt de IA */}
            {aiPrompt && (
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Bot className="h-5 w-5" />
                    🤖 PROMPT PARA REPORTE DE IA
                  </CardTitle>
                  <CardDescription className="text-purple-700">
                    Prompt profesional estructurado para generar reportes narrativos de 2-3 minutos con IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
          <div className="space-y-4">
                    <div className="p-4 bg-white border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-purple-800">Prompt Generado:</h4>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={copyAIPromptToClipboard}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar Todo
                          </Button>
            </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border">
                          {aiPrompt}
                </pre>
              </div>
            </div>
            
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Instrucciones de Uso:
                      </h5>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>1. Copia el prompt completo usando el botón "Copiar Todo"</p>
                        <p>2. Pégalo en ChatGPT, Claude, Gemini o cualquier IA de texto</p>
                        <p>3. La IA generará un reporte narrativo de 2-3 minutos (320-450 palabras)</p>
                        <p>4. El reporte incluirá análisis integrado, plan práctico y cita clásica védica</p>
                        <p>5. Formato optimizado para TTS (texto a voz) en español natural</p>
                      </div>
            </div>
          </div>
        </CardContent>
      </Card>
            )}
    </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PanchangaDetailPanel