import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const DebugAPI: React.FC = () => {
  const [generalResult, setGeneralResult] = useState<any>(null)
  const [dailyResult, setDailyResult] = useState<any>(null)
  const [panchangaResult, setPanchangaResult] = useState<any>(null)
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jyotish-api-ndcfqrjivq-uc.a.run.app'

  const setLoadingState = (key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }))
  }

  const testGeneralData = async () => {
    setLoadingState('general', true)
    setGeneralResult(null)
    
    try {
      console.log('Testing general panchanga data...')
      const response = await fetch(`${API_BASE_URL}/v1/panchanga/recommendations/panchanga/all`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('General data response:', data)
      setGeneralResult({ success: true, data })
    } catch (error: any) {
      console.error('Error:', error)
      setGeneralResult({ success: false, error: error.message })
    } finally {
      setLoadingState('general', false)
    }
  }
  
  const testDailyRecommendations = async () => {
    setLoadingState('daily', true)
    setDailyResult(null)
    
    try {
      console.log('Testing daily recommendations...')
      const queryParams = new URLSearchParams({
        date: '2025-01-15',
        latitude: '19.076',
        longitude: '72.8777'
      })
      
      const url = `${API_BASE_URL}/v1/panchanga/recommendations/daily?${queryParams}`
      console.log('URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Daily recommendations response:', data)
      setDailyResult({ success: true, data })
    } catch (error: any) {
      console.error('Error:', error)
      setDailyResult({ success: false, error: error.message })
    } finally {
      setLoadingState('daily', false)
    }
  }
  
  const testWithPanchangaData = async () => {
    setLoadingState('panchanga', true)
    setPanchangaResult(null)
    
    try {
      console.log('Testing with panchanga data...')
      const queryParams = new URLSearchParams({
        date: '2025-01-15',
        latitude: '19.076',
        longitude: '72.8777',
        vara: 'Monday',
        tithi: 'Pratipada',
        nakshatra: 'Aśvinī',
        nitya_yoga: 'Viśkumbha'
      })
      
      const url = `${API_BASE_URL}/v1/panchanga/recommendations/daily?${queryParams}`
      console.log('URL with panchanga data:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Panchanga data response:', data)
      setPanchangaResult({ success: true, data })
    } catch (error: any) {
      console.error('Error:', error)
      setPanchangaResult({ success: false, error: error.message })
    } finally {
      setLoadingState('panchanga', false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔍 Debug API Calls</h1>
        <p className="text-muted-foreground">Test de las llamadas a la API de recomendaciones de panchanga</p>
        <p className="text-sm text-muted-foreground mt-2">
          API Base URL: <code className="bg-muted px-2 py-1 rounded">{API_BASE_URL}</code>
        </p>
      </div>

      <div className="grid gap-6">
        {/* Test 1: General Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Test 1: Datos Generales del Panchanga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testGeneralData} 
              disabled={loading.general}
              className="w-full"
            >
              {loading.general ? '🔄 Cargando...' : 'Test /v1/panchanga/recommendations/panchanga/all'}
            </Button>
            
            {generalResult && (
              <div className="mt-4">
                <Separator className="my-4" />
                <div className={`p-4 rounded-lg ${generalResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className={`font-semibold mb-2 ${generalResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {generalResult.success ? '✅ Éxito!' : '❌ Error'}
                  </h4>
                  <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
                    {JSON.stringify(generalResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test 2: Daily Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Test 2: Recomendaciones Diarias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testDailyRecommendations} 
              disabled={loading.daily}
              className="w-full"
            >
              {loading.daily ? '🔄 Cargando...' : 'Test /v1/panchanga/recommendations/daily'}
            </Button>
            
            {dailyResult && (
              <div className="mt-4">
                <Separator className="my-4" />
                <div className={`p-4 rounded-lg ${dailyResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className={`font-semibold mb-2 ${dailyResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {dailyResult.success ? '✅ Éxito!' : '❌ Error'}
                  </h4>
                  <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
                    {JSON.stringify(dailyResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test 3: With Panchanga Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Test 3: Con Datos Específicos del Panchanga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p><strong>Parámetros de prueba:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Fecha: 2025-01-15</li>
                <li>Vara: Monday</li>
                <li>Tithi: Pratipada</li>
                <li>Nakshatra: Aśvinī</li>
                <li>Nitya Yoga: Viśkumbha</li>
              </ul>
            </div>
            
            <Button 
              onClick={testWithPanchangaData} 
              disabled={loading.panchanga}
              className="w-full"
            >
              {loading.panchanga ? '🔄 Cargando...' : 'Test con datos específicos del panchanga'}
            </Button>
            
            {panchangaResult && (
              <div className="mt-4">
                <Separator className="my-4" />
                <div className={`p-4 rounded-lg ${panchangaResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h4 className={`font-semibold mb-2 ${panchangaResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {panchangaResult.success ? '✅ Éxito!' : '❌ Error'}
                  </h4>
                  <pre className="text-xs overflow-x-auto bg-white p-3 rounded border">
                    {JSON.stringify(panchangaResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DebugAPI
