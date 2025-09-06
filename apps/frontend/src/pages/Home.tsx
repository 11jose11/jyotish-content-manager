import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Home: React.FC = () => {
  const features = [
    {
      title: '🌙 Tránsitos',
      description: 'Calendario mensual de posiciones planetarias y cambios de nakshatra',
      href: '/transits',
      icon: '🌙'
    },
    {
      title: '📅 Pañchāṅga',
      description: 'Calendario védico con Tithi, Vara, Nakshatra, Yoga y Karana',
      href: '/panchanga',
      icon: '📅'
    },
    {
      title: '🌌 Navatāra',
      description: 'Cálculo de Navatara con tabla unificada 9x3',
      href: '/navatara',
      icon: '🌌'
    },
    {
      title: '⚡ Chesta Bala',
      description: 'Análisis de cambios de velocidad planetaria',
      href: '/chesta-bala',
      icon: '⚡'
    },
    {
      title: '🌑 Eclipses',
      description: 'Dashboard de temporadas de eclipses y su impacto astrológico',
      href: '/eclipses',
      icon: '🌑'
    },
    {
      title: '🔧 Diagnóstico',
      description: 'Estado de conexión y diagnóstico de la API',
      href: '/diagnostics',
      icon: '🔧'
    }
  ]

  return (
    <div className="p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🌙 Jyotish Content Manager</h1>
        <p className="text-xl text-muted-foreground">
          Herramienta completa para cálculos astrológicos védicos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card key={feature.href} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{feature.icon}</span>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {feature.description}
              </CardDescription>
              <Button asChild className="w-full">
                <Link to={feature.href}>
                  Acceder
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>🚀 API Conectada</CardTitle>
            <CardDescription>
              Conectado a la API de Jyotish en Google Cloud Run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>📍 URL: https://jyotish-api-ndcfqrjivq-uc.a.run.app</p>
              <p>🔑 Autenticación: X-API-Key</p>
              <p>📊 Endpoints: Panchanga, Efemérides, Yogas, Movimiento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home

