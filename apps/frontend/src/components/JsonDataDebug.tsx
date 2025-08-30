import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const JsonDataDebug: React.FC = () => {
  const [jsonData, setJsonData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testJsonFiles = async () => {
    setLoading(true)
    setError(null)
    
    const files = [
      'Nakashatras.json',
      'TIthi.json',
      'karanas.json',
      'Vara.json',
      'nitya-yogas.json',
      'yogas-special.json'
    ]
    
    const results: any = {}
    
    for (const file of files) {
      try {
        console.log(`🔍 Testing ${file}...`)
        const response = await fetch(`/json-database/${file}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        results[file] = {
          status: 'success',
          data: data,
          size: JSON.stringify(data).length
        }
        console.log(`✅ ${file} loaded successfully:`, data)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        results[file] = {
          status: 'error',
          error: errorMsg
        }
        console.error(`❌ ${file} failed:`, err)
      }
    }
    
    setJsonData(results)
    setLoading(false)
  }

  const testPanchangaData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test with a sample nakshatra name
      const nakshatraName = 'Aśvinī'
      console.log(`🔍 Testing panchanga data lookup for: ${nakshatraName}`)
      
      const response = await fetch(`/json-database/Nakashatras.json`)
      const data = await response.json()
      
      const nakshatra = data.nakshatras?.find((n: any) => 
        n.nombre.toLowerCase().includes(nakshatraName.toLowerCase())
      )
      
      console.log('🔍 Found nakshatra:', nakshatra)
      
      setJsonData({
        'Nakshatra Lookup Test': {
          status: 'success',
          searchTerm: nakshatraName,
          found: !!nakshatra,
          data: nakshatra
        }
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error('❌ Panchanga data test failed:', err)
    }
    
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 JSON Data Debug</CardTitle>
          <CardDescription>
            Verificar la carga de archivos JSON y datos del panchanga
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testJsonFiles} disabled={loading}>
              {loading ? 'Probando...' : 'Test JSON Files'}
            </Button>
            <Button onClick={testPanchangaData} disabled={loading} variant="outline">
              {loading ? 'Probando...' : 'Test Panchanga Data'}
            </Button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {Object.keys(jsonData).length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Resultados:</h3>
              {Object.entries(jsonData).map(([file, result]: [string, any]) => (
                <div key={file} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                    <span className="font-medium">{file}</span>
                  </div>
                  
                  {result.status === 'success' ? (
                    <div className="text-sm text-muted-foreground">
                      <p>✅ Cargado exitosamente</p>
                      {result.size && <p>Tamaño: {result.size} caracteres</p>}
                      {result.searchTerm && (
                        <>
                          <p>Búsqueda: {result.searchTerm}</p>
                          <p>Encontrado: {result.found ? 'Sí' : 'No'}</p>
                        </>
                      )}
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600">Ver datos</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600">
                      <p>❌ Error: {result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default JsonDataDebug
