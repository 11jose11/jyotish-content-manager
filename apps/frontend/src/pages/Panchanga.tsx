import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { usePanchangaMonth, useApiHealth } from '@/lib/api'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import PanchangaDetailPanel from '@/components/PanchangaDetailPanel'
import JsonDataDebug from '@/components/JsonDataDebug'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

const Panchanga: React.FC = () => {
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

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedDayData, setSelectedDayData] = useState<any>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)


  // Precargar datos JSON al montar el componente
  useEffect(() => {
    // El servicio simplificado se carga automáticamente cuando se necesita
  }, [])

  // Check API health (reconnected after CORS fix)
  const { data: apiHealth } = useApiHealth()

  const { data: panchangaData, isLoading, error } = usePanchangaMonth({
    year: selectedYear,
    month: selectedMonth,
    latitude: location.latitude,
    longitude: location.longitude,
  })

  const handleDayClick = (day: any) => {
    console.log('🔍 Day data from API:', {
      date: day.date,
      tithi: day.tithi,
      vara: day.vara,
      nakshatra: day.nakshatra,
      yoga: day.yoga,
      karana: day.karana,
      specialYogas: day.specialYogas
    })
    
    // Log especial para yogas especiales
    if (day.specialYogas && day.specialYogas.length > 0) {
      console.log('✨ Special Yogas Details:', day.specialYogas)
      day.specialYogas.forEach((yoga: any, index: number) => {
        console.log(`Yoga ${index + 1}:`, {
          name: yoga.name,
          type: yoga.type,
          polarity: yoga.polarity,
          description: yoga.description,
          fullObject: yoga
        })
      })
    } else {
      console.log('❌ No special yogas found for this day')
    }
    
    setSelectedDay(day.date)
    setSelectedDayData(day)
    setIsDetailPanelOpen(true)
    toast.success(`Detalles del ${new Date(day.date).toLocaleDateString('es-ES')}`)
  }

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false)
    setSelectedDay(null)
    setSelectedDayData(null)
  }

  const renderCalendar = () => {
    if (!panchangaData?.days) return null
    
    const days = panchangaData.days
    
    // Obtener el primer día del mes y su día de la semana
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
    const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Domingo, 1 = Lunes, etc.
    
    // Obtener el número de días en el mes
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    
    // Crear array de días del calendario
    const calendarDays = []
    
    // Agregar días vacíos antes del primer día del mes
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push(null)
    }
    
    // Agregar los días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
      const dayData = days.find((d: any) => d.date === dateStr)
      calendarDays.push(dayData || { date: dateStr, tithi: { name: 'N/A' }, vara: { name: 'N/A' }, nakshatra: { name: 'N/A' }, yoga: { name: 'N/A' }, karana: { name: 'N/A' }, specialYogas: [] })
    }
    
    // Agrupar en semanas
    const weeks = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      const week = calendarDays.slice(i, i + 7)
      weeks.push(week)
    }
    
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    return (
      <div className="space-y-2">
        {/* Header con nombres de días */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((dayName, index) => (
            <div key={index} className="text-center text-sm font-semibold text-muted-foreground p-2">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendario */}
        <div className="grid gap-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day: any, dayIndex: number) => (
                <Card 
                  key={dayIndex} 
                  className={`p-3 min-h-[180px] transition-all duration-200 ${
                    !day ? 'bg-muted/20' : 'cursor-pointer hover:shadow-md hover:scale-105'
                  } ${
                    selectedDay === day?.date ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => day && handleDayClick(day)}
                >
                  {day ? (
                    <>
                      <div className="text-center text-sm font-medium mb-2">
                        {new Date(day.date).getDate()}
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="text-center">
                          <span className="font-medium text-blue-600">
                            {day.tithi?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-green-600">
                            {day.vara?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-purple-600">
                            {day.nakshatra?.name || 'N/A'}
                          </span>
                          {day.nakshatra?.pada && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              p{day.nakshatra.pada}
                            </Badge>
                          )}
                        </div>
                        <div className="text-center">
                          <span className="text-orange-600">
                            {day.yoga?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-indigo-600">
                            {day.karana?.name || 'N/A'}
                          </span>
                        </div>
                        {/* Semáforo de colores para el día */}
                        {day.trafficLight && day.trafficLight !== 'neutral' && (
                          <div className="flex justify-center mb-1">
                            <div className={`w-3 h-3 rounded-full ${
                              day.trafficLight === 'green' ? 'bg-green-500' :
                              day.trafficLight === 'yellow' ? 'bg-yellow-500' :
                              day.trafficLight === 'red' ? 'bg-red-500' :
                              'bg-gray-400'
                            }`} title={`Semáforo: ${day.trafficLight}`}></div>
                          </div>
                        )}
                        
                        {/* Yogas especiales */}
                        {day.specialYogas && day.specialYogas.length > 0 && (
                          <div className="space-y-1">
                            {day.specialYogas.slice(0, 2).map((yoga: any, index: number) => (
                              <div key={index} className="flex justify-center">
                                <Badge 
                                  variant={yoga.polarity === 'positive' ? 'default' : 'destructive'} 
                                  className="text-xs px-1 py-0.5"
                                >
                                  {yoga.name || yoga.type || 'Yoga'}
                                </Badge>
                              </div>
                            ))}
                            {day.specialYogas.length > 2 && (
                              <div className="text-center text-muted-foreground text-xs">
                                +{day.specialYogas.length - 2} más
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground text-xs">
                      {/* Celda vacía */}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ))}
        </div>
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
              No se pudieron cargar los datos del calendario panchanga.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🌙 Calendario Panchanga</h1>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendario Mensual</CardTitle>
              <CardDescription>
                Haz click en cualquier día para ver los detalles completos del pañcāṅga
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${apiHealth ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-muted-foreground">
                API: {apiHealth ? 'Conectada' : 'Desconectada'}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                🔄 Recargar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Cargando calendario progresivamente...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Carga por lotes de 3 días con pausas para evitar errores CORS
              </p>
            </div>
          ) : (
            renderCalendar()
          )}
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedDayData && selectedDay && (
        <PanchangaDetailPanel
          date={selectedDay}
          panchanga={selectedDayData.details || selectedDayData}
          isOpen={isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />
      )}


      {/* Debug Component - Temporary */}
      <JsonDataDebug />
    </div>
  )
}

export default Panchanga
