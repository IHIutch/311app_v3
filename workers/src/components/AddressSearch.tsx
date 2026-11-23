import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { useEffect, useEffectEvent, useRef, useState } from 'react'

type SelectedAddress = {
  lat: number
  lng: number
  streetNumber: string
  streetName: string
  postalCode: string
}

const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
let places: Promise<google.maps.PlacesLibrary> | undefined

function loadPlaces() {
  if (!places) {
    setOptions({ key, v: 'weekly' })
    places = importLibrary('places')
  }
  return places
}

export function AddressSearch({ onSelect }: { onSelect: (address: SelectedAddress) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const select = useEffectEvent(onSelect)

  useEffect(() => {
    if (!key || !host.current) return
    const target = host.current
    let active = true
    async function mount() {
      const { PlaceAutocompleteElement } = await loadPlaces()
      if (!active) return
      const widget = new PlaceAutocompleteElement({
        includedRegionCodes: ['us'],
        locationBias: { center: { lat: 42.886, lng: -78.879 }, radius: 15000 },
      })
      widget.setAttribute('aria-label', 'Search for a Buffalo address')
      widget.addEventListener('gmp-select', async ({ placePrediction }: google.maps.places.PlacePredictionSelectEvent) => {
        try {
          const place = placePrediction.toPlace()
          await place.fetchFields({ fields: ['location', 'addressComponents'] })
          if (!active || !place.location) return
          const part = (name: string) => place.addressComponents?.find(component => component.types.includes(name))?.longText ?? ''
          select({
            lat: place.location.lat(),
            lng: place.location.lng(),
            streetNumber: part('street_number'),
            streetName: part('route'),
            postalCode: part('postal_code'),
          })
        } catch {
          if (active) setError(true)
        }
      })
      widget.addEventListener('gmp-error', () => { if (active) setError(true) })
      target.appendChild(widget)
    }
    void mount().catch(() => { if (active) setError(true) })
    return () => {
      active = false
      target.replaceChildren()
    }
  }, [])

  if (!key) return null
  return <div><div ref={host} />{error && <p role="status">Address search is unavailable. Choose a point on the map or enter the address below.</p>}</div>
}
