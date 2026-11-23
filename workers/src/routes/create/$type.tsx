import { useState } from 'react'
import { ClientOnly, Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { AddressSearch } from '../../components/AddressSearch'
import { ReportForm } from '../../components/ReportForm'
import { ReportMap } from '../../components/ReportMap'
import { reportTypeSlug } from '../../report-types'

const getType = createServerFn().validator((slug: string) => slug).handler(async ({ data }) => {
  const { listReportTypes } = await import('../../server/reports.server')
  const type = (await listReportTypes()).find(entry => reportTypeSlug(entry.name) === data)
  if (!type) throw notFound()
  return type
})

export const Route = createFileRoute('/create/$type')({
  loader: ({ params }) => getType({ data: params.type }),
  component: CreateReport,
})

function CreateReport() {
  const type = Route.useLoaderData()
  const navigate = useNavigate()
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [streetName, setStreetName] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [addressCenter, setAddressCenter] = useState<[number, number]>()
  const latLng = lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
    ? [{ id: 0, lat: Number(lat), lng: Number(lng), markerColor: type.markerColor }]
    : []

  return (
    <main>
      <Link to="/create">All report types</Link>
      <h1>Report {type.name.toLowerCase()}</h1>
      <ReportForm action="/api/reports/" submit="Submit report"
        onCreated={id => void navigate({ to: '/reports/$id', params: { id: String(id) } })}>
        <input name="reportTypeId" type="hidden" value={type.id} />
        <p>Select the location on the map or enter the coordinates.</p>
        <ClientOnly fallback={<div className="map-placeholder" />}>
          <AddressSearch onSelect={address => {
            setLat(String(address.lat))
            setLng(String(address.lng))
            setStreetNumber(address.streetNumber)
            setStreetName(address.streetName)
            setPostalCode(address.postalCode)
            setAddressCenter([address.lat, address.lng])
          }} />
          <ReportMap key={addressCenter?.join(',')} center={addressCenter} points={latLng} onChoose={([latitude, longitude]) => {
            setLat(latitude.toFixed(6))
            setLng(longitude.toFixed(6))
          }} />
        </ClientOnly>
        <div className="fields">
          <label>Latitude <input name="lat" type="number" step="any" min="-90" max="90" value={lat} onChange={e => setLat(e.target.value)} required /></label>
          <label>Longitude <input name="lng" type="number" step="any" min="-180" max="180" value={lng} onChange={e => setLng(e.target.value)} required /></label>
          <label>Street number <input name="streetNumber" type="number" min="0" value={streetNumber} onChange={e => setStreetNumber(e.target.value)} /></label>
          <label>Street name <input name="streetName" maxLength={200} value={streetName} onChange={e => setStreetName(e.target.value)} /></label>
          <label>ZIP code <input name="postalCode" autoComplete="postal-code" maxLength={20} value={postalCode} onChange={e => setPostalCode(e.target.value)} /></label>
          <label>Your email (optional) <input name="email" type="email" autoComplete="email" maxLength={254} /></label>
        </div>
        <label>Details <textarea name="details" maxLength={5000} rows={4} /></label>
        <label>Photos (up to three, 5 MB each) <input name="photo" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" /></label>
      </ReportForm>
    </main>
  )
}
