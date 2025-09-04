import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Activity, Gauge, RotateCcw, Zap } from 'lucide-react'

// Mapeo de estados de movimiento con valores y colores según tradición védica
const MOTION_STATES = {
  vakra: { value: 60, color: 'bg-red-100 text-red-800', devanagari: 'वक्र', transliteration: 'vakra', spanish: 'Retrógrado', description: 'Retrógrado' },
  anuvakra: { value: 30, color: 'bg-orange-100 text-orange-800', devanagari: 'अनुवक्र', transliteration: 'anuvakra', spanish: 'Directo después de retrogradación', description: 'Directo después de retrogradación' },
  vikala: { value: 15, color: 'bg-gray-100 text-gray-800', devanagari: 'विकल', transliteration: 'vikala', spanish: 'Estacionario', description: 'Estacionario (sin movimiento)' },
  mandatara: { value: 15, color: 'bg-gray-100 text-gray-800', devanagari: 'मन्दतर', transliteration: 'mandatara', spanish: 'Muy Lento', description: 'Muy lento' },
  manda: { value: 30, color: 'bg-yellow-100 text-yellow-800', devanagari: 'मन्द', transliteration: 'manda', spanish: 'Lento', description: 'Lento' },
  sama: { value: 30, color: 'bg-blue-100 text-blue-800', devanagari: 'साम', transliteration: 'sama', spanish: 'Movimiento Medio', description: 'Movimiento medio' },
  chara: { value: 30, color: 'bg-green-100 text-green-800', devanagari: 'चरा', transliteration: 'chara', spanish: 'Rápido', description: 'Rápido' },
  sighra: { value: 30, color: 'bg-green-100 text-green-800', devanagari: 'शीघ्र', transliteration: 'sighra', spanish: 'Rápido', description: 'Rápido' },
  atichara: { value: 45, color: 'bg-emerald-100 text-emerald-800', devanagari: 'अतिचरा', transliteration: 'atichara', spanish: 'Muy Rápido', description: 'Muy rápido' },
  sighratara: { value: 45, color: 'bg-emerald-100 text-emerald-800', devanagari: 'शीघ्रतर', transliteration: 'sighratara', spanish: 'Muy Rápido', description: 'Muy rápido' },
  kutilaka: { value: 37.5, color: 'bg-purple-100 text-purple-800', devanagari: 'कुटिलक', transliteration: 'kuṭilaka', spanish: 'Irregular', description: 'Movimiento irregular, zigzagueante, estacionario' }
}

// Mapeo de planetas con nombres en español
const PLANET_NAMES = {
  Sun: 'Sol',
  Moon: 'Luna',
  Mars: 'Marte',
  Mercury: 'Mercurio',
  Jupiter: 'Júpiter',
  Venus: 'Venus',
  Saturn: 'Saturno',
  Rahu: 'Rahu',
  Ketu: 'Ketu'
}

// Mapeo de niveles de fuerza
const STRENGTH_LEVELS = {
  'Excelente': { color: 'bg-emerald-100 text-emerald-800', icon: '🌟' },
  'Buena': { color: 'bg-green-100 text-green-800', icon: '✅' },
  'Moderada': { color: 'bg-yellow-100 text-yellow-800', icon: '⚡' },
  'Baja': { color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
  'Muy Baja': { color: 'bg-red-100 text-red-800', icon: '❌' }
}

interface PlanetData {
  graha: string
  graha_es: string
  chesta_avasta: string
  chesta_avasta_transliteration: string
  categoria: string
  categoria_transliteration: string
  motion_state_sanskrit: string
  motion_state_transliteration: string
  chesta_bala: number
  velocidad_grados_por_dia: number
  is_retrograde: boolean
  strength_level: string
}

interface ChestaBalaDailyPanelProps {
  planets: Record<string, PlanetData>
  date: string
  isLoading?: boolean
}

export const ChestaBalaDailyPanel: React.FC<ChestaBalaDailyPanelProps> = ({ 
  planets, 
  date, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Análisis Diario de Chesta Bala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getMotionStateInfo = (state: string) => {
    return MOTION_STATES[state as keyof typeof MOTION_STATES] || {
      value: 0,
      color: 'bg-gray-100 text-gray-800',
      devanagari: state,
      description: 'Estado desconocido'
    }
  }

  const getPlanetName = (planet: string) => {
    return PLANET_NAMES[planet as keyof typeof PLANET_NAMES] || planet
  }

  const getStrengthInfo = (level: string) => {
    return STRENGTH_LEVELS[level as keyof typeof STRENGTH_LEVELS] || {
      color: 'bg-gray-100 text-gray-800',
      icon: '❓'
    }
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

  const planetEntries = Object.entries(planets)

  if (planetEntries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Análisis Diario de Chesta Bala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No hay datos disponibles para esta fecha
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Análisis Diario de Chesta Bala
        </CardTitle>
        <p className="text-sm text-gray-600">
          {formatDate(date)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen del día */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Planetas Analizados</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {planetEntries.length}
            </div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <RotateCcw className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Planetas Retrógrados</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {planetEntries.filter(([_, data]) => data.is_retrograde).length}
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Promedio Chesta Bala</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {(planetEntries.reduce((sum, [_, data]) => sum + data.chesta_bala, 0) / planetEntries.length).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Detalles por planeta */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Detalles por Planeta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planetEntries.map(([planetKey, data]) => {
              const motionState = getMotionStateInfo(data.motion_state_transliteration)
              const strengthInfo = getStrengthInfo(data.strength_level)
              
              return (
                <div key={planetKey} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">{getPlanetName(planetKey)}</h4>
                    {data.is_retrograde && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Retrógrado
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estado de Movimiento:</span>
                      <Badge className={motionState.color}>
                        {motionState.transliteration} ({motionState.spanish})
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chesta Bala:</span>
                      <span className="font-medium">{data.chesta_bala}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Velocidad:</span>
                      <span className="font-medium">{data.velocidad_grados_por_dia.toFixed(2)}°/día</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Nivel de Fuerza:</span>
                      <Badge className={strengthInfo.color}>
                        {strengthInfo.icon} {data.strength_level}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      <div><strong>Devanagari:</strong> {data.graha}</div>
                      <div><strong>Estado:</strong> {data.chesta_avasta} ({data.chesta_avasta_transliteration})</div>
                      <div><strong>Categoría:</strong> {data.categoria} ({data.categoria_transliteration})</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Leyenda de estados */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Estados de Movimiento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {Object.entries(MOTION_STATES).map(([key, state]) => (
              <div key={key} className="flex items-center gap-2">
                <Badge className={`${state.color} text-xs`}>
                  {state.transliteration}
                </Badge>
                <span className="text-gray-600">
                  {state.spanish}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChestaBalaDailyPanel
