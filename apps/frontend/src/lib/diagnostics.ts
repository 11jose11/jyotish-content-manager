// Diagnostic utilities

export interface EndpointStatus {
  ok: boolean
  status?: number
  error?: string
  latencyMs?: number
}

export interface RemoteDiagnostic {
  baseUrl: string
  ok: boolean
  latencyMs?: number
  error?: string
  endpoints: Record<string, EndpointStatus>
}

export interface BackendDiagnostic {
  ok: boolean
  ts: string
  version: string
  ephemeris: boolean
}

export interface DiagnosticResponse {
  backend: BackendDiagnostic
  remote: RemoteDiagnostic
}

export type ConnectionStatus = 'ok' | 'warning' | 'error' | 'unknown'

export const getConnectionStatus = (diagnostic: DiagnosticResponse | null): ConnectionStatus => {
  if (!diagnostic) return 'unknown'
  
  if (diagnostic.backend.ok && diagnostic.remote.ok) {
    return 'ok'
  } else if (diagnostic.backend.ok && !diagnostic.remote.ok) {
    return 'warning'
  } else {
    return 'error'
  }
}

export const getStatusColor = (status: ConnectionStatus): string => {
  switch (status) {
    case 'ok':
      return 'bg-green-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export const getStatusText = (status: ConnectionStatus): string => {
  switch (status) {
    case 'ok':
      return 'Conectado'
    case 'warning':
      return 'Modo degradado'
    case 'error':
      return 'Sin conexión'
    default:
      return 'Desconocido'
  }
}

export const formatLatency = (latencyMs?: number): string => {
  if (!latencyMs) return 'N/A'
  return `${latencyMs.toFixed(0)}ms`
}

export const formatTimestamp = (ts: string): string => {
  return new Date(ts).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
