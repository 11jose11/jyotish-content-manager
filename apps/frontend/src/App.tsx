import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Transits from './pages/Transits'
import Panchanga from './pages/Panchanga'
import Navatara from './pages/Navatara'
import ChestaBala from './pages/ChestaBala'
import EclipseDashboard from './pages/EclipseDashboard'
import Diagnostics from './pages/Diagnostics'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/transits" element={<Transits />} />
                <Route path="/panchanga" element={<Panchanga />} />
                <Route path="/navatara" element={<Navatara />} />
                <Route path="/chesta-bala" element={<ChestaBala />} />
                <Route path="/eclipses" element={<EclipseDashboard />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
              </Routes>
            </Layout>
          </Router>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
