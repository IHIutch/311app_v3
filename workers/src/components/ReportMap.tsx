import { Map, Marker, ZoomControl } from 'pigeon-maps'
import { hasMapLocation } from '../report-types'

type Point = { id: number; lat: number; lng: number; markerColor: string }
const buffalo: [number, number] = [42.886, -78.879]
const token = import.meta.env.VITE_MAPBOX_TOKEN

export function ReportMap({ points, center = buffalo, onChoose, onSelect }: {
  points: Point[]
  center?: [number, number]
  onChoose?: (coords: [number, number]) => void
  onSelect?: (id: number) => void
}) {
  return (
    <Map
      height={330}
      defaultCenter={center}
      defaultZoom={13}
      provider={token ? (x, y, z) => `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/${z}/${x}/${y}@2x?access_token=${encodeURIComponent(token)}` : undefined}
      attribution={token ? <a href="https://www.mapbox.com/about/maps/">Mapbox</a> : undefined}
      onClick={onChoose ? ({ latLng }) => onChoose(latLng) : undefined}
    >
      <ZoomControl />
      {points.filter(hasMapLocation).map(point => (
        <Marker key={point.id} anchor={[point.lat, point.lng]} width={30} color={point.markerColor}
          onClick={onSelect ? () => onSelect(point.id) : undefined} />
      ))}
    </Map>
  )
}
