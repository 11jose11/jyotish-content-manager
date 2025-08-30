import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://jyotish-api-ndcfqrjivq-uc.a.run.app'}/info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        if (response.ok) {
          setStatus('connected')
        } else {
          setStatus('disconnected')
        }
      } catch (error) {
        console.warn('API connection check failed:', error)
        setStatus('disconnected')
      }
    }

    checkConnection()
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'disconnected':
        return 'bg-red-500'
      case 'checking':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-3 w-3" />
      case 'disconnected':
        return <XCircle className="h-3 w-3" />
      case 'checking':
        return <Wifi className="h-3 w-3 animate-pulse" />
      default:
        return <WifiOff className="h-3 w-3" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      case 'checking':
        return 'Verificando...'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2 text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Button>
    </div>
  )
}

export default ConnectionStatus
