import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Copy, FileText } from 'lucide-react'
import { useNavataraData } from '@/lib/api'
import { toast } from 'sonner'
import LocationAutocomplete from '@/components/LocationAutocomplete'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

interface NavataraMapping {
  relPosition: number
  nakshatra: {
    index: number
    nameIAST: string
    pada: number
  }
  tara: {
    name: string
    description: string
  }
  loka: {
    name: string
    description: string
  }
  deity: {
    name: string
    description: string
  }
}

const TARA_NAMES = [
  'Janma', 'Sampat', 'Vipat', 'Kṣema', 'Pratyak',
  'Sādhana', 'Naidhana', 'Mitra', 'Parama Mitra'
]

const DEITY_NAMES = [
  'Gaṇeśa', 'Lakṣmī', 'Sūrya', 'Gaurī', 'Skanda',
  'Durgā', 'Śiva', 'Kālī', 'Kṛṣṇa'
]

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
  'Swati', 'Vishakha', 'Anuradha', 'Jyeshta', 'Mula',
  'Purva Ashadha', 'Uttara Ashadha', 'Sravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]

const Navatara: React.FC = () => {
  const [referenceType, setReferenceType] = useState<'moon' | 'sun' | 'ascendant' | 'nakshatra'>('moon')
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
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
  const [selectedNakshatra, setSelectedNakshatra] = useState(1)

  const { data: navataraData, error } = useNavataraData()

  const handleCalculate = () => {
    console.log('Calculating Navatara with:', {
      referenceType,
      dateTime,
      location,
      selectedNakshatra
    })
    
    toast.success('Cálculo de Navatara iniciado')
  }

  const generateTableHTML = () => {
    if (!navataraData?.mapping) return ''
    
    let html = '<table class="tabla-navatara">'
    html += '<thead><tr><th>Tārā</th><th>#</th><th>Bhu Loka (1–9)</th><th>#</th><th>Bhuva Loka (10–18)</th><th>#</th><th>Swarga Loka (19–27)</th><th>Devata</th></tr></thead>'
    html += '<tbody>'
    
    for (let i = 0; i < 9; i++) {
      const taraName = TARA_NAMES[i]
      const bhuIndex = i + 1
      const bhuvaIndex = i + 10
      const swargaIndex = i + 19
      const deityName = DEITY_NAMES[i]
      
      const bhuMapping = navataraData.mapping.find((m: NavataraMapping) => m.relPosition === bhuIndex)
      const bhuvaMapping = navataraData.mapping.find((m: NavataraMapping) => m.relPosition === bhuvaIndex)
      const swargaMapping = navataraData.mapping.find((m: NavataraMapping) => m.relPosition === swargaIndex)
      
      html += '<tr>'
      html += `<td>${taraName}</td>`
      html += `<td>${bhuIndex}</td>`
      html += `<td>${bhuMapping ? `${bhuMapping.nakshatra.nameIAST} p${bhuMapping.nakshatra.pada}` : ''}</td>`
      html += `<td>${bhuvaIndex}</td>`
      html += `<td>${bhuvaMapping ? `${bhuvaMapping.nakshatra.nameIAST} p${bhuvaMapping.nakshatra.pada}` : ''}</td>`
      html += `<td>${swargaIndex}</td>`
      html += `<td>${swargaMapping ? `${swargaMapping.nakshatra.nameIAST} p${swargaMapping.nakshatra.pada}` : ''}</td>`
      html += `<td>${deityName}</td>`
      html += '</tr>'
    }
    
    html += '<tr class="loka-header">'
    html += '<td></td><td></td><td>🌍 Bhu Loka</td><td></td><td>☀️ Bhuva Loka</td><td></td><td>✨ Swarga Loka</td><td></td>'
    html += '</tr>'
    html += '</tbody></table>'
    
    return html
  }

  const handleCopyTable = () => {
    const html = generateTableHTML()
    navigator.clipboard.writeText(html)
    toast.success('Tabla copiada al portapapeles')
  }

  const handleExportJSON = () => {
    if (!navataraData) return
    
    const data = {
      calculation: {
        referenceType,
        dateTime,
        location,
        selectedNakshatra
      },
      mapping: navataraData.mapping
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `navatara-${dateTime.split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Datos exportados como JSON')
  }

  const renderNavataraTable = () => {
    if (!navataraData?.mapping) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay datos de Navatara disponibles</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-center">Tārā</th>
              <th className="border border-border p-2 text-center">#</th>
              <th className="border border-border p-2 text-center">Bhu Loka (1–9)</th>
              <th className="border border-border p-2 text-center">#</th>
              <th className="border border-border p-2 text-center">Bhuva Loka (10–18)</th>
              <th className="border border-border p-2 text-center">#</th>
              <th className="border border-border p-2 text-center">Swarga Loka (19–27)</th>
              <th className="border border-border p-2 text-center">Devata</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 9 }, (_, i) => {
              const taraName = TARA_NAMES[i]
              const bhuIndex = i + 1
              const bhuvaIndex = i + 10
              const swargaIndex = i + 19
              const deityName = DEITY_NAMES[i]
              
              const bhuMapping = navataraData.mapping.find((m: NavataraMapping) => m.relPosition === bhuIndex)
              const bhuvaMapping = navataraData.mapping.find((m: NavataraMapping) => m.relPosition === bhuvaIndex)
              const swargaMapping = navataraData.mapping.find((m: NavataraMapping) => m.relPosition === swargaIndex)
              
              return (
                <tr key={i}>
                  <td className="border border-border p-2 text-center font-medium">{taraName}</td>
                  <td className="border border-border p-2 text-center">{bhuIndex}</td>
                  <td className="border border-border p-2 text-center">
                    {bhuMapping ? `${bhuMapping.nakshatra.nameIAST} p${bhuMapping.nakshatra.pada}` : ''}
                  </td>
                  <td className="border border-border p-2 text-center">{bhuvaIndex}</td>
                  <td className="border border-border p-2 text-center">
                    {bhuvaMapping ? `${bhuvaMapping.nakshatra.nameIAST} p${bhuvaMapping.nakshatra.pada}` : ''}
                  </td>
                  <td className="border border-border p-2 text-center">{swargaIndex}</td>
                  <td className="border border-border p-2 text-center">
                    {swargaMapping ? `${swargaMapping.nakshatra.nameIAST} p${swargaMapping.nakshatra.pada}` : ''}
                  </td>
                  <td className="border border-border p-2 text-center">{deityName}</td>
                </tr>
              )
            })}
            <tr className="bg-muted font-bold">
              <td className="border border-border p-2 text-center"></td>
              <td className="border border-border p-2 text-center"></td>
              <td className="border border-border p-2 text-center">🌍 Bhu Loka</td>
              <td className="border border-border p-2 text-center"></td>
              <td className="border border-border p-2 text-center">☀️ Bhuva Loka</td>
              <td className="border border-border p-2 text-center"></td>
              <td className="border border-border p-2 text-center">✨ Swarga Loka</td>
              <td className="border border-border p-2 text-center"></td>
            </tr>
          </tbody>
        </table>
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
              No se pudieron cargar los datos de Navatara.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🌌 Navatāra</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>
            Selecciona el tipo de referencia y los parámetros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Referencia</Label>
              <Select value={referenceType} onValueChange={(value) => setReferenceType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moon">Luna</SelectItem>
                  <SelectItem value="sun">Sol</SelectItem>
                  <SelectItem value="ascendant">Ascendente</SelectItem>
                  <SelectItem value="nakshatra">Nakshatra Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {referenceType === 'nakshatra' && (
              <div>
                <Label>Nakshatra</Label>
                <Select value={selectedNakshatra.toString()} onValueChange={(value) => setSelectedNakshatra(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NAKSHATRAS.map((nakshatra, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {nakshatra}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {referenceType !== 'nakshatra' && (
              <>
                <div>
                  <Label>Fecha y Hora</Label>
                  <Input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Ciudad</Label>
                  <LocationAutocomplete
                    value={location}
                    onChange={setLocation}
                    placeholder="Buscar ciudad..."
                  />
                </div>
              </>
            )}
          </div>
          
          <Button onClick={handleCalculate} className="w-full">
            Calcular Navatāra
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {navataraData && (
        <Card>
          <CardHeader>
            <CardTitle>Tabla Navatāra 9×3</CardTitle>
            <CardDescription>
              Resultado del cálculo de Navatāra
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderNavataraTable()}
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCopyTable}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Tabla
              </Button>
              <Button onClick={handleExportJSON}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Navatara
