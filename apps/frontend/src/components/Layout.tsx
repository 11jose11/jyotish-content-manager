import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, MapPin, Clock, Settings } from 'lucide-react'
import { useTheme } from '@/lib/themes'
import ConnectionStatus from './ConnectionStatus'
import LocationAutocomplete from './LocationAutocomplete'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [defaultLocation, setDefaultLocation] = useState<Location>(() => {
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
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const navigation = [
    { name: 'Inicio', href: '/', icon: '🏠' },
    { name: 'Tránsitos', href: '/transits', icon: '🌙' },
    { name: 'Pañchāṅga', href: '/panchanga', icon: '📅' },
    { name: 'Navatāra', href: '/navatara', icon: '🌌' },
    { name: 'Chesta Bala', href: '/chesta-bala', icon: '⚡' },
    { name: 'Eclipses', href: '/eclipses', icon: '🌑' },
    { name: 'Diagnóstico', href: '/diagnostics', icon: '🔧' },
  ]

  const isActive = (href: string) => location.pathname === href

  useEffect(() => {
    localStorage.setItem('jyotish-default-location', JSON.stringify(defaultLocation))
  }, [defaultLocation])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl">🌙</span>
              <span className="font-bold">Jyotish</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {/* Location & Timezone */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{defaultLocation.city}</span>
                <Clock className="h-4 w-4" />
                <span>{defaultLocation.timezone}</span>
                
                {/* Location Settings Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurar Ubicación por Defecto</DialogTitle>
                      <DialogDescription>
                        Cambia la ciudad por defecto que se mostrará en la navegación
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Ciudad por Defecto</label>
                        <LocationAutocomplete
                          value={defaultLocation}
                          onChange={setDefaultLocation}
                          placeholder="Buscar ciudad para ubicación por defecto..."
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Ciudad:</strong> {defaultLocation.city}</p>
                        <p><strong>Coordenadas:</strong> {defaultLocation.latitude.toFixed(4)}, {defaultLocation.longitude.toFixed(4)}</p>
                        <p><strong>Zona Horaria:</strong> {defaultLocation.timezone}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Connection Status */}
              <ConnectionStatus />

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4">
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`
                        flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                        ${isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span>{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </nav>
                
                {/* Mobile Location Info */}
                <div className="mt-6 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{defaultLocation.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{defaultLocation.timezone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Full width with minimal margins */}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}

export default Layout
