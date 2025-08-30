import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDiagnostics } from '@/lib/api'

const Diagnostics: React.FC = () => {
  const { data: diagnosticsData, isLoading, error, refetch } = useDiagnostics()

  const getOverallStatus = (): 'ok' | 'warning' | 'error' => {
    if (!diagnosticsData) return 'error'
    
    const backendOk = diagnosticsData.backend?.ok
    const remoteOk = diagnosticsData.remote?.ok
    
    if (backendOk && remoteOk) return 'ok'
    if (backendOk || remoteOk) return 'warning'
    return 'error'
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
              No se pudieron cargar los datos de diagnóstico.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔧 Diagnóstico del Sistema</h1>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Conexión</CardTitle>
          <CardDescription>
            Verifica el estado de conexión con la API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? 'Probando...' : 'Probar Conexión'}
          </Button>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Estado General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getOverallStatus() === 'ok' ? '✅' : getOverallStatus() === 'warning' ? '⚠️' : '❌'}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Estado General
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {diagnosticsData?.remote?.latencyMs || 'N/A'}ms
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Latencia
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Date(diagnosticsData?.backend?.ts || Date.now()).toLocaleTimeString()}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Última Verificación
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Status */}
        <Card>
          <CardHeader>
            <CardTitle>Backend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Estado:</span>
                <Badge variant={diagnosticsData?.backend?.ok ? 'default' : 'destructive'}>
                  {diagnosticsData?.backend?.ok ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Código de Estado:</span>
                <span className="text-sm">{diagnosticsData?.backend?.status || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Timestamp:</span>
                <span className="text-sm">
                  {diagnosticsData?.backend?.ts ? new Date(diagnosticsData.backend.ts).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remote API Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Remota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Estado:</span>
                <Badge variant={diagnosticsData?.remote?.ok ? 'default' : 'destructive'}>
                  {diagnosticsData?.remote?.ok ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>URL:</span>
                <span className="text-sm truncate max-w-32">{diagnosticsData?.remote?.baseUrl || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Latencia:</span>
                <span className="text-sm">{diagnosticsData?.remote?.latencyMs || 'N/A'}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {diagnosticsData?.remote?.endpoints && Object.entries(diagnosticsData.remote.endpoints).map(([endpoint, status]) => (
              <div key={endpoint} className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">{endpoint}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={(status as any).ok ? 'default' : 'destructive'}>
                    {(status as any).ok ? 'OK' : 'Error'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {(status as any).status || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Crudos</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(diagnosticsData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

export default Diagnostics
