/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Google Maps API types
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => google.maps.places.AutocompleteService
          PlacesService: new (div: HTMLElement) => google.maps.places.PlacesService
          PlacesServiceStatus: {
            OK: string
            ZERO_RESULTS: string
            OVER_QUERY_LIMIT: string
            REQUEST_DENIED: string
            INVALID_REQUEST: string
            UNKNOWN_ERROR: string
          }
        }
      }
    }
  }
}

declare namespace google {
  namespace maps {
    namespace places {
      interface AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
        ): void
      }

      interface PlacesService {
        getDetails(
          request: PlaceDetailsRequest,
          callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void
        ): void
      }

      interface AutocompletionRequest {
        input: string
        types?: string[]
        componentRestrictions?: ComponentRestrictions
      }

      interface ComponentRestrictions {
        country: string[]
      }

      interface AutocompletePrediction {
        place_id: string
        description: string
        structured_formatting: {
          main_text: string
          secondary_text: string
        }
      }

      interface PlaceDetailsRequest {
        placeId: string
        fields: string[]
      }

      interface PlaceResult {
        geometry?: {
          location?: google.maps.LatLng
        }
        formatted_address?: string
        address_components?: google.maps.GeocoderAddressComponent[]
      }

      type PlacesServiceStatus = 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR'
    }
  }
}
