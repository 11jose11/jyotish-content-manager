import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, TrendingUp, Activity, Zap } from 'lucide-react'

// Mapeo de estados de movimiento con valores y colores
const MOTION_STATES = {
  vakra: { value: 60, color: 'bg-red-100 text-red-800', devanagari: 'वक्र', description: 'Retrógrado' },
  anuvakra: { value: 30, color: 'bg-orange-100 text-orange-800', devanagari: 'अनुवक्र', description: 'Directo después de retrogradación' },
  vikala: { value: 15, color: 'bg-gray-100 text-gray-800', devanagari: 'विकल', description: 'Estacionario' },
  mandatara: { value: 15, color: 'bg-gray-100 text-gray-800', devanagari: 'मन्दतर', description: 'Muy lento' },
  manda: { value: 30, color: 'bg-yellow-100 text-yellow-800', devanagari: 'मन्द', description: 'Lento' },
  sama: { value: 30, color: 'bg-blue-100 text-blue-800', devanagari: 'साम', description: 'Movimiento medio' },
  chara: { value: 30, color: 'bg-green-100 text-green-800', devanagari: 'चरा', description: 'Rápido' },
  sighra: { value: 30, color: 'bg-green-100 text-green-800', devanagari: 'शीघ्र', description: 'Rápido' },
  atichara: { value: 45, color: 'bg-emerald-100 text-emerald-800', devanagari: 'अतिचरा', description: 'Muy rápido' },
  sighratara: { value: 45, color: 'bg-emerald-100 text-emerald-800', devanagari: 'शीघ्रतर', description: 'Muy rápido' },
  kutilaka: { value: 37.5, color: 'bg-purple-100 text-purple-800', devanagari: 'कुटिलक', description: 'Movimiento irregular' }
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

interface MotionChange {
  date: string
  from_state: string
  to_state: string
  from_sanskrit: string
  to_sanskrit: string
  chesta_bala_change: number
}

interface MonthlySummary {
  total_motion_changes: number
  changes_by_planet: Record<string, MotionChange[]>
  planet_averages: Record<string, number>
  most_active_planet: string | null
  average_chesta_bala: number
}

interface ChestaBalaPanelProps {
  summary: MonthlySummary
  isLoading?: boolean
}

export const ChestaBalaPanel: React.FC<ChestaBalaPanelProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Análisis de Chesta Bala
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Análisis de Chesta Bala - Resumen Mensual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Cambios Totales</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {summary.total_motion_changes}
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Promedio Chesta Bala</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {summary.average_chesta_bala.toFixed(1)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Planeta Más Activo</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {summary.most_active_planet ? getPlanetName(summary.most_active_planet) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Cambios por Planeta */}
        {Object.keys(summary.changes_by_planet).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Cambios de Movimiento por Planeta</h3>
            <div className="space-y-4">
              {Object.entries(summary.changes_by_planet).map(([planet, changes]) => (
                <div key={planet} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">{getPlanetName(planet)}</h4>
                    <Badge variant="outline">
                      {changes.length} cambio{changes.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {changes.map((change, index) => {
                      const fromState = getMotionStateInfo(change.from_state)
                      const toState = getMotionStateInfo(change.to_state)
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{formatDate(change.date)}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={fromState.color}>
                                {fromState.devanagari} ({change.from_state})
                              </Badge>
                              <span className="text-gray-500">→</span>
                              <Badge className={toState.color}>
                                {toState.devanagari} ({change.to_state})
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Chesta Bala: {change.chesta_bala_change}
                            </div>
                            <div className="text-xs text-gray-500">
                              {change.chesta_bala_change > 0 ? '+' : ''}{change.chesta_bala_change}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promedios por Planeta */}
        {Object.keys(summary.planet_averages).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Promedios de Chesta Bala por Planeta</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(summary.planet_averages).map(([planet, average]) => (
                <div key={planet} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{getPlanetName(planet)}</div>
                  <div className="text-lg font-bold text-gray-900">{average.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ChestaBalaPanel
