import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface Location {
  city: string
  latitude: number
  longitude: number
  timezone: string
}

interface PlaceResult {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface LocationAutocompleteProps {
  value: Location
  onChange: (location: Location) => void
  placeholder?: string
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Buscar ciudad..."
}) => {
  const [searchTerm, setSearchTerm] = useState(value.city)
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Initialize Google Places API
    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService()
      if (inputRef.current) {
        const mapDiv = document.createElement('div')
        placesService.current = new (window as any).google.maps.places.PlacesService(mapDiv)
      }
    }
  }, [])

  const searchPlaces = async (query: string) => {
    if (!autocompleteService.current || !query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Try multiple search strategies
      const strategies = [
        // Strategy 1: Cities only
        {
          input: query,
          types: ['(cities)'],
        },
        // Strategy 2: Administrative areas (broader)
        {
          input: query,
          types: ['administrative_area_level_1', 'administrative_area_level_2'],
        },
        // Strategy 3: No type restrictions
        {
          input: query,
        }
      ]

      let allPredictions: any[] = []
      
      for (const strategy of strategies) {
        try {
          const predictions = await new Promise<any[]>((resolve, reject) => {
            autocompleteService.current.getPlacePredictions(strategy, (predictions: any, status: any) => {
              if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
                resolve(predictions)
              } else {
                reject(new Error(`Status: ${status}`))
              }
            })
          })
          
          allPredictions = [...allPredictions, ...predictions]
        } catch (error) {
          console.warn(`Strategy failed:`, strategy, error)
        }
      }

      // Remove duplicates and limit results
      const uniquePredictions = allPredictions.filter((prediction, index, self) => 
        index === self.findIndex(p => p.place_id === prediction.place_id)
      ).slice(0, 10)

      setSuggestions(uniquePredictions)
    } catch (error) {
      console.error('Error searching places:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchTerm(query)
    setShowSuggestions(true)
    
    if (query.length > 2) {
      searchPlaces(query)
    } else {
      setSuggestions([])
    }
  }

  const handlePlaceSelect = (place: PlaceResult) => {
    if (!placesService.current) return

    placesService.current.getDetails(
      {
        placeId: place.place_id,
        fields: ['geometry', 'formatted_address', 'address_components']
      },
      (placeDetails: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && placeDetails) {
          const lat = placeDetails.geometry?.location?.lat()
          const lng = placeDetails.geometry?.location?.lng()
          
          if (lat && lng) {
            // Get timezone using Google Timezone API
            getTimezone(lat, lng).then(timezone => {
              const newLocation: Location = {
                city: place.structured_formatting.main_text,
                latitude: lat,
                longitude: lng,
                timezone: timezone || 'UTC'
              }
              onChange(newLocation)
              setSearchTerm(place.structured_formatting.main_text)
              setShowSuggestions(false)
            })
          }
        }
      }
    )
  }

  const getTimezone = async (lat: number, lng: number): Promise<string> => {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.warn('Google Maps API key not found, using UTC')
        return 'UTC'
      }
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`
      )
      const data = await response.json()
      return data.timeZoneId || 'UTC'
    } catch (error) {
      console.error('Error getting timezone:', error)
      return 'UTC'
    }
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((place) => (
              <button
                key={place.place_id}
                onClick={() => handlePlaceSelect(place)}
                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{place.structured_formatting.main_text}</div>
                  <div className="text-sm text-muted-foreground">
                    {place.structured_formatting.secondary_text}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LocationAutocomplete
