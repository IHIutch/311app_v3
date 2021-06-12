import { Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Tooltip,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapboxEmbed({ latLng, handleSetLocation }) {
  const [center] = useState(latLng || [42.886, -78.879])

  return (
    <>
      <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
        />
        <LocationMarker latLng={latLng} handleSetLocation={handleSetLocation} />
      </MapContainer>
    </>
  )
}

const LocationMarker = ({ latLng, handleSetLocation }) => {
  const [position, setPosition] = useState(null)
  const map = useMapEvents({
    click(e) {
      map.locate()
      setPosition(e.latlng)
      handleSetLocation(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  useEffect(() => {
    if (latLng) {
      setPosition(latLng)
      map.flyTo(latLng, map.getZoom())
    }
  }, [latLng, map])

  return (
    position && (
      <Marker position={position}>
        <Tooltip direction="top" offset={[-15, -15]} permanent>
          <Text fontSize="sm">
            Lat: {position.lat.toFixed(3)}, Lng: {position.lng.toFixed(3)}
          </Text>
        </Tooltip>
      </Marker>
    )
  )
}
