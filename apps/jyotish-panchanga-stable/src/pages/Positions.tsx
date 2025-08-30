import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { usePositionsMonth } from '@/lib/api'

const Positions: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [latitude, setLatitude] = useState('19.0760')
  const [longitude, setLongitude] = useState('72.8777')

  const { data: positionsData, isLoading, error } = usePositionsMonth({
    year,
    month,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  })

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error al cargar datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No se pudieron cargar los datos de posiciones.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🌙 Posiciones Planetarias</h1>
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
              <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
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
              <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
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
              <Label>Latitud</Label>
              <Input
                placeholder="Latitud"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Longitud</Label>
              <Input
                placeholder="Longitud"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Posiciones Mensuales</CardTitle>
          <CardDescription>
            Posiciones planetarias para {year}/{month}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando datos...</p>
            </div>
          ) : positionsData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positionsData.days?.map((day: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="text-center font-medium mb-3">
                      {new Date(day.date).toLocaleDateString('es', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                    <div className="space-y-2">
                      {day.positions?.map((position: any, posIndex: number) => (
                        <div key={posIndex} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{position.planet}</span>
                          <div className="flex items-center gap-2">
                            <span>{position.nakshatra.nameIAST}</span>
                            <Badge variant="outline" className="text-xs">
                              p{position.nakshatra.pada}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No hay datos disponibles para el período seleccionado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Positions

