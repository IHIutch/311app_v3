import { useEffect, useId, useState, type KeyboardEvent } from 'react'
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

type MapboxFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    mapbox_id?: string
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

async function findAddresses(query: string, signal: AbortSignal) {
  const params = new URLSearchParams({
    q: query,
    access_token: token,
    autocomplete: 'true',
    country: 'us',
    types: 'address',
    bbox: '-78.94,42.82,-78.79,42.98',
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

  return features.flatMap(({ properties, geometry }): Address[] => {
    const { mapbox_id: id, full_address, name, context } = properties ?? {}
    const label = full_address ?? name
    const point = geometry?.coordinates
    if (!id || !label || !point) return []
    const [lng, lat] = point
    if (!hasMapLocation({ lat, lng })) return []
    const number = context?.address?.address_number ?? ''
    return [{
      id, label, lat, lng,
      streetNumber: /^\d+$/.test(number) ? number : '',
      streetName: context?.street?.name ?? context?.address?.street_name ?? '',
      postalCode: context?.postcode?.name ?? '',
    }]
  })
}

export function AddressSearch({ onSelect }: { onSelect: (address: Address) => void }) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selection, setSelection] = useState('')
  const [results, setResults] = useState<Address[]>([])
  const [active, setActive] = useState(-1)
  const [status, setStatus] = useState('')

  const search = query.trim()
  const canSearch = open && search.length >= 3 && query !== selection

  useEffect(() => {
    if (!token || !canSearch) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      void findAddresses(search, controller.signal)
        .then(addresses => {
          if (controller.signal.aborted) return
          setResults(addresses)
          setStatus(addresses.length ? '' : 'No matching addresses. You can choose a point on the map.')
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setStatus('Address search is unavailable. You can choose a point on the map or enter the address manually.')
          }
        })
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [canSearch, search])

  if (!token) return null

  function choose(address: Address) {
    setQuery(address.label)
    setSelection(address.label)
    setOpen(false)
    setResults([])
    setActive(-1)
    setStatus('')
    onSelect(address)
  }

  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (open && results[active]) choose(results[active])
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
      <label htmlFor={id}>Search for a Buffalo address</label>
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
        <ul id={listId} role="listbox" aria-label="Address suggestions">
          {results.map((address, index) => (
            <li key={address.id} id={listId + '-' + index} role="option"
              aria-selected={active === index}
              onMouseDown={event => event.preventDefault()}
              onClick={() => choose(address)}>
              {address.label}
            </li>
          ))}
        </ul>
      )}
      {open && status && <p role="status">{status}</p>}
    </div>
  )
}
