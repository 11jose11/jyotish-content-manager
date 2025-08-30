import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useCalendarMonth } from '@/lib/api'
import LocationAutocomplete from '@/components/LocationAutocomplete'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

const Positions: React.FC = () => {
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

  const { data: calendarData, isLoading, error } = useCalendarMonth({
    year: selectedYear,
    month: selectedMonth,
    latitude: location.latitude,
    longitude: location.longitude,
  })

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

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Calendario</CardTitle>
          <CardDescription>
            Información del calendario mensual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando datos...</p>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground">
                Datos cargados correctamente desde el endpoint del calendario mensual.
              </p>
              {calendarData && (
                <div className="mt-4">
                  <Badge variant="outline">
                    Días cargados: {calendarData.days?.length || 0}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Positions

