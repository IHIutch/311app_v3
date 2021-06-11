import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'

export default function Map() {
  return (
    <MapContainer
      style={{ height: '100%', width: '100%' }}
      center={[42.886, -78.879]}
      zoom={13}
    >
      <TileLayer
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
      />
    </MapContainer>
  )
}
