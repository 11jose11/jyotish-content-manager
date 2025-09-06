import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Sparkles, Star, Sun, Moon, Zap, Calendar, X, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { panchangaSimplifiedService } from '@/lib/panchangaSimplifiedService'

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
        yoga: panchanga.yoga?.name
      })
      
      const recs = await panchangaSimplifiedService.getDayRecommendations({
        tithi: panchanga.tithi,
        vara: panchanga.vara,
        nakshatra: panchanga.nakshatra,
        yoga: panchanga.yoga
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

  if (!isOpen) return null

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>
              Panchanga Completo - {new Date(date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Los cinco angas del panchanga con todas sus recomendaciones
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando recomendaciones...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Debug Info */}
            <Card className="border-gray-200 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1">
                  <div><strong>Tithi API:</strong> {panchanga.tithi?.name || 'N/A'}</div>
                  <div><strong>Vara API:</strong> {panchanga.vara?.name || 'N/A'}</div>
                  <div><strong>Nakshatra API:</strong> {panchanga.nakshatra?.name || 'N/A'}</div>
                  <div><strong>Yoga API:</strong> {panchanga.yoga?.name || 'N/A'}</div>
                  <div><strong>Karana API:</strong> {panchanga.karana?.name || 'N/A'}</div>
                  <div><strong>Special Yogas:</strong> {panchanga.specialYogas?.length || 0} encontrados</div>
                  <div><strong>Found Tithi:</strong> {recommendations?.tithi?.name || 'No encontrado'}</div>
                  <div><strong>Found Vara:</strong> {recommendations?.vara?.name || 'No encontrado'}</div>
                  <div><strong>Found Nakshatra:</strong> {recommendations?.nakshatra?.name || 'No encontrado'}</div>
                  <div><strong>Found Yoga:</strong> {recommendations?.yoga?.name || 'No encontrado'}</div>
                  
                  {/* Debug de yogas especiales */}
                  {panchanga.specialYogas && panchanga.specialYogas.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div><strong>Special Yogas Details:</strong></div>
                      {panchanga.specialYogas.map((yoga: any, index: number) => (
                        <div key={index} className="ml-2 text-xs">
                          {index + 1}. {yoga.name || yoga.type || 'Sin nombre'} 
                          ({yoga.polarity || 'Sin polaridad'})
                          {yoga.description && ` - ${yoga.description.substring(0, 50)}...`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* 1. NAKSHATRA */}
            {panchanga.nakshatra && recommendations?.nakshatra && (
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Moon className="h-5 w-5" />
                    1. NAKSHATRA - {recommendations.nakshatra.name}
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {recommendations.nakshatra.translation} | Deidad: {recommendations.nakshatra.deity} | Planeta: {recommendations.nakshatra.planet} | Elemento: {recommendations.nakshatra.element}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations.nakshatra.classification}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Actividades Favorables ({recommendations.nakshatra.favorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.nakshatra.favorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Actividades a Evitar ({recommendations.nakshatra.desfavorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.nakshatra.desfavorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. TITHI */}
            {panchanga.tithi && recommendations?.tithi && (
              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Sun className="h-5 w-5" />
                    2. TITHI - {recommendations.tithi.name}
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    {recommendations.tithi.translation} | Deidad: {recommendations.tithi.deity} | Elemento: {recommendations.tithi.element}
                    {panchanga.tithi.index && ` | Día ${panchanga.tithi.index}`}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations.tithi.classification}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Actividades Favorables ({recommendations.tithi.favorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.tithi.favorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Actividades a Evitar ({recommendations.tithi.desfavorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.tithi.desfavorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. KARANA */}
            {panchanga.karana && (
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Star className="h-5 w-5" />
                    3. KARANA - {panchanga.karana.name}
                  </CardTitle>
                  <CardDescription className="text-purple-700">
                    El karana es la mitad de un tithi y representa las actividades más específicas del día
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>El karana actual es <strong>{panchanga.karana.name}</strong>, que influye en las actividades más detalladas del día.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. VARA */}
            {panchanga.vara && recommendations?.vara && (
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Calendar className="h-5 w-5" />
                    4. VARA - {recommendations.vara.name}
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    {recommendations.vara.translation} | Planeta: {recommendations.vara.planet}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations.vara.classification}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Actividades Favorables ({recommendations.vara.favorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.vara.favorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Actividades a Evitar ({recommendations.vara.desfavorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.vara.desfavorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. YOGA */}
            {panchanga.yoga && recommendations?.yoga && (
              <Card className="border-yellow-200">
                <CardHeader className="bg-yellow-50">
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Zap className="h-5 w-5" />
                    5. YOGA - {recommendations.yoga.name}
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    {recommendations.yoga.translation} | Deidad: {recommendations.yoga.deity} | Planeta: {recommendations.yoga.planet}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit">
                    {recommendations.yoga.classification}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.yoga.detailed_description && (
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <p className="text-sm text-yellow-800">{recommendations.yoga.detailed_description}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Actividades Favorables ({recommendations.yoga.favorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.yoga.favorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Actividades a Evitar ({recommendations.yoga.desfavorables.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {recommendations.yoga.desfavorables.map((activity: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 6. YOGAS ESPECIALES */}
            {panchanga.specialYogas && panchanga.specialYogas.length > 0 && (
              <Card className="border-indigo-200">
                <CardHeader className="bg-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <Sparkles className="h-5 w-5" />
                    6. YOGAS ESPECIALES ({panchanga.specialYogas.length})
                  </CardTitle>
                  <CardDescription className="text-indigo-700">
                    Yogas especiales que ocurren en este día específico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {panchanga.specialYogas.map((yoga: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">
                              {yoga.name || yoga.type || `Yoga Especial ${index + 1}`}
                            </h4>
                            {yoga.type && yoga.type !== yoga.name && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Tipo: {yoga.type}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={yoga.polarity === 'positive' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {yoga.polarity === 'positive' ? 'Auspicioso' : 'Desfavorable'}
                          </Badge>
                        </div>
                        
                        {/* Información detallada del yoga */}
                        <div className="space-y-3">
                          {yoga.description && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <h5 className="font-medium text-sm mb-1">Descripción:</h5>
                              <p className="text-sm text-gray-700">
                                {yoga.description}
                              </p>
                            </div>
                          )}
                          
                          {/* Información adicional si está disponible */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {yoga.deity && (
                              <div>
                                <span className="font-medium">Deidad:</span> {yoga.deity}
                              </div>
                            )}
                            {yoga.planet && (
                              <div>
                                <span className="font-medium">Planeta:</span> {yoga.planet}
                              </div>
                            )}
                            {yoga.element && (
                              <div>
                                <span className="font-medium">Elemento:</span> {yoga.element}
                              </div>
                            )}
                            {yoga.classification && (
                              <div>
                                <span className="font-medium">Clasificación:</span> {yoga.classification}
                              </div>
                            )}
                            {yoga.category && (
                              <div>
                                <span className="font-medium">Categoría:</span> {yoga.category}
                              </div>
                            )}
                            {yoga.priority && (
                              <div>
                                <span className="font-medium">Prioridad:</span> {yoga.priority}
                              </div>
                            )}
                          </div>
                          
                          {/* Actividades específicas del yoga */}
                          {(yoga.beneficial_activities || yoga.favorables) && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-green-700">
                                Actividades Beneficiosas:
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {(yoga.beneficial_activities || yoga.favorables || []).map((activity: string, actIndex: number) => (
                                  <Badge key={actIndex} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                    {activity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {(yoga.avoid_activities || yoga.desfavorables) && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-red-700">
                                Actividades a Evitar:
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {(yoga.avoid_activities || yoga.desfavorables || []).map((activity: string, actIndex: number) => (
                                  <Badge key={actIndex} variant="destructive" className="text-xs">
                                    {activity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Notas adicionales */}
                          {yoga.notes && (
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <h5 className="font-medium text-sm mb-1 text-yellow-800">Notas:</h5>
                              <p className="text-xs text-yellow-700">{yoga.notes}</p>
                            </div>
                          )}
                          
                          {/* Indicador visual de polaridad */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            {yoga.polarity === 'positive' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {yoga.polarity === 'positive' 
                                ? 'Este yoga es favorable para actividades importantes y auspiciosas' 
                                : 'Este yoga requiere precaución en actividades importantes'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* RESUMEN GENERAL */}
            {recommendations && (
              <Card className="border-gray-200 bg-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Resumen General del Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Todas las Actividades Recomendadas
                      </h4>
                      <div className="space-y-2">
                        {recommendations.summary.favorableActivities.map((activity: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Todas las Actividades a Evitar
                      </h4>
                      <div className="space-y-2">
                        {recommendations.summary.avoidActivities.map((activity: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span className="text-sm">{activity}</span>
                          </div>
                        ))}
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