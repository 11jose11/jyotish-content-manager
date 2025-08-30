// CSV Export utilities

export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return

  // Convert data to CSV format
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Export Transits data to CSV
export const exportTransitsCSV = (positionsData: any, selectedPlanets: string[], year: number, month: number) => {
  if (!positionsData?.planets) return

  const csvData = []
  
  // Add metadata row
  csvData.push({
    'Tipo': 'Metadata',
    'Año': year,
    'Mes': month,
    'Planetas': selectedPlanets.join(', '),
    'Total Días': positionsData.planets[0]?.days?.length || 0
  })

  // Add transitions
  positionsData.transitions
    .filter((t: any) => selectedPlanets.includes(t.planet))
    .forEach((transition: any) => {
      csvData.push({
        'Tipo': 'Transición',
        'Planeta': transition.planet,
        'Fecha': transition.date,
        'Desde': transition.from,
        'Hasta': transition.to
      })
    })

  // Add daily positions
  selectedPlanets.forEach(planet => {
    const planetData = positionsData.planets.find((p: any) => p.name === planet)
    if (planetData?.days) {
      planetData.days.forEach((day: any) => {
        csvData.push({
          'Tipo': 'Posición',
          'Planeta': planet,
          'Fecha': day.date,
          'Nakshatra': day.nakshatra.nameIAST,
          'Pada': day.nakshatra.pada,
          'Signo': day.signSidereal,
          'Retrógrado': day.retrograde ? 'Sí' : 'No'
        })
      })
    }
  })

  downloadCSV(csvData, `transitos-${year}-${month}`)
}

// Export Panchanga data to CSV
export const exportPanchangaCSV = (panchangaData: any, year: number, month: number) => {
  if (!panchangaData?.days) return

  const csvData = panchangaData.days.map((day: any) => ({
    'Fecha': day.date,
    'Tithi': day.tithi.code,
    'Grupo Tithi': day.tithi.group,
    'Vara': day.vara,
    'Nakshatra': day.nakshatra.nameIAST,
    'Pada': day.nakshatra.pada,
    'Yoga': day.yoga,
    'Karana': day.karana,
    'Amanecer': new Date(day.sunriseISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    'Atardecer': new Date(day.sunsetISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    'Yogas Especiales': day.specialYogas.map((y: any) => `${y.name} (${y.polarity})`).join(', ') || 'Ninguno'
  }))

  downloadCSV(csvData, `panchanga-${year}-${month}`)
}

// Export Navatara data to CSV
export const exportNavataraCSV = (navataraData: any, frame: string) => {
  if (!navataraData?.mapping) return

  const csvData = navataraData.mapping.map((item: any) => ({
    'Tara': item.roleLabel,
    'Posición': item.relPosition,
    'Ciclo': item.cycle,
    'Loka': item.loka,
    'Grupo 9': item.group9,
    'Deidad': item.groupDeity,
    'Nakshatra': item.absolute.nameIAST,
    'Índice Nakshatra': item.absolute.index,
    'Señor Planetario': item.absolute.planetLord,
    'Taras Especiales': item.specialTaras.join(', ') || 'Ninguna'
  }))

  downloadCSV(csvData, `navatara-${frame}-${new Date().toISOString().split('T')[0]}`)
}
