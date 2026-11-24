import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { hasMapLocation } from '../report-types'

type Address = {
  id: string
  label: string
  lat: number
  lng: number
  streetNumber: string
  streetName: string
  postalCode: string
}

type PlaceSuggestion = { id: string; label: string; session: string }
type Suggestion = Address | PlaceSuggestion

type MapboxFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    mapbox_id?: string
    address?: string
    full_address?: string
    name?: string
    context?: {
      address?: { address_number?: string; street_name?: string }
      street?: { name?: string }
      postcode?: { name?: string }
    }
  }
}

const token = import.meta.env.VITE_MAPBOX_TOKEN
const buffaloBounds = '-78.94,42.82,-78.79,42.98'
const searchBox = 'https://api.mapbox.com/search/searchbox/v1'

function parseAddress({ properties, geometry }: MapboxFeature): Address[] {
  const { mapbox_id: id, full_address, name, context, address } = properties ?? {}
  const label = full_address ?? name
  const point = geometry?.coordinates
  if (!id || !label || !point) return []
  const [lng, lat] = point
  if (!hasMapLocation({ lat, lng })) return []
  const number = context?.address?.address_number ?? address?.match(/^(\d+)\s/)?.[1] ?? ''
  const street = address?.match(/^\d+\s+(.+)$/)?.[1]
  return [{
    id, label, lat, lng,
    streetNumber: /^\d+$/.test(number) ? number : '',
    streetName: street ?? context?.street?.name ?? context?.address?.street_name ?? '',
    postalCode: context?.postcode?.name ?? '',
  }]
}

async function findPlaces(query: string, session: string, signal: AbortSignal): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    q: query, session_token: session, access_token: token,
    country: 'us', types: 'poi,address,street', bbox: buffaloBounds, limit: '5',
  })
  const response = await fetch(searchBox + '/suggest?' + params, { signal, cache: 'no-store' })
  if (!response.ok) throw new Error('Location search failed')
  const { suggestions } = await response.json() as {
    suggestions: { mapbox_id: string; name: string; full_address?: string; place_formatted?: string }[]
  }
  return suggestions.map(suggestion => ({
    id: suggestion.mapbox_id,
    label: [suggestion.name, suggestion.full_address || suggestion.place_formatted].filter(Boolean).join(' · '),
    session,
  }))
}

async function retrievePlace(suggestion: PlaceSuggestion, signal: AbortSignal) {
  const params = new URLSearchParams({ access_token: token, session_token: suggestion.session })
  const response = await fetch(searchBox + '/retrieve/' + encodeURIComponent(suggestion.id) + '?' + params, {
    signal, cache: 'no-store',
  })
  if (!response.ok) throw new Error('Location search failed')
  const { features } = await response.json() as { features: MapboxFeature[] }
  const [address] = features.flatMap(parseAddress)
  if (!address) throw new Error('Location has no map coordinates')
  return address
}

async function findAddresses(query: string, signal: AbortSignal) {
  const params = new URLSearchParams({
    q: query,
    access_token: token,
    autocomplete: 'true',
    country: 'us',
    types: 'address',
    bbox: buffaloBounds,
    limit: '5',
  })
  if (import.meta.env.VITE_MAPBOX_PERMANENT_GEOCODING === 'true') {
    params.set('permanent', 'true')
  }
  const response = await fetch('https://api.mapbox.com/search/geocode/v6/forward?' + params, {
    signal,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Address search failed')
  const { features } = await response.json() as { features: MapboxFeature[] }

  return features.flatMap(parseAddress)
}

export function AddressSearch({ onSelect }: { onSelect: (address: Address) => void }) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selection, setSelection] = useState('')
  const [results, setResults] = useState<Suggestion[]>([])
  const session = useRef<{ id: string; started: number } | null>(null)
  const retrieving = useRef<AbortController | null>(null)
  const [active, setActive] = useState(-1)
  const [status, setStatus] = useState('')

  const search = query.trim()
  const canSearch = open && search.length >= 3 && query !== selection

  useEffect(() => () => retrieving.current?.abort(), [])

  useEffect(() => {
    if (!token || !canSearch) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      async function suggest() {
        if (/^\d+\s/.test(search)) {
          const addresses = await findAddresses(search, controller.signal)
          if (addresses.length) return addresses
        }
        if (controller.signal.aborted) return []
        if (!session.current || Date.now() - session.current.started >= 170_000) {
          session.current = { id: crypto.randomUUID(), started: Date.now() }
        }
        return findPlaces(search, session.current.id, controller.signal)
      }

      void suggest().then(addresses => {
          if (controller.signal.aborted) return
          setResults(addresses)
          setStatus(addresses.length ? '' : 'No matching locations. You can choose a point on the map.')
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setStatus('Location search is unavailable. You can choose a point on the map or enter the address manually.')
          }
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [canSearch, search])

  if (!token) return null

  async function choose(suggestion: Suggestion) {
    retrieving.current?.abort()
    setQuery(suggestion.label)
    setSelection(suggestion.label)
    setResults([])
    setActive(-1)
    setStatus('')

    if ('session' in suggestion) {
      const controller = new AbortController()
      retrieving.current = controller
      session.current = null
      setStatus('Getting location…')
      try {
        const address = await retrievePlace(suggestion, controller.signal)
        if (controller.signal.aborted) return
        onSelect(address)
      } catch {
        if (!controller.signal.aborted) {
          setStatus('Could not load this location. Try searching again or choose a point on the map.')
        }
        return
      } finally {
        if (retrieving.current === controller) retrieving.current = null
      }
    } else {
      onSelect(suggestion)
    }
    setStatus('')
    setOpen(false)
  }

  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (open && results[active]) void choose(results[active])
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (!results.length) return
      const offset = event.key === 'ArrowDown' ? 1 : -1
      setActive(index => index < 0 && offset < 0 ? results.length - 1 : (index + offset + results.length) % results.length)
    }
  }

  const expanded = open && results.length > 0
  const listId = id + '-suggestions'

  return (
    <div className="address-search">
      <label htmlFor={id}>Search for a Buffalo address or landmark</label>
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded && active >= 0 ? listId + '-' + active : undefined}
        autoComplete="off"
        placeholder="65 Niagara Square"
        maxLength={200}
        value={query}
        onChange={event => {
          retrieving.current?.abort()
          setQuery(event.target.value)
          setOpen(true)
          setActive(-1)
          setResults([])
          setStatus('')
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => { setOpen(false); setActive(-1) }}
        onKeyDown={navigate}
      />
      {expanded && (
        <ul id={listId} role="listbox" aria-label="Location suggestions">
          {results.map((address, index) => (
            <li key={address.id} id={listId + '-' + index} role="option"
              aria-selected={active === index}
              onMouseDown={event => event.preventDefault()}
              onClick={() => void choose(address)}>
              {address.label}
            </li>
          ))}
        </ul>
      )}
      {open && status && <p role="status">{status}</p>}
    </div>
  )
}
