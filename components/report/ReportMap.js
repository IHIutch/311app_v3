import React from 'react'
import { Box, useToken } from '@chakra-ui/react'
import {
  CircleMarker,
  FeatureGroup,
  MapContainer,
  TileLayer,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function ReportMap({ marker }) {
  return (
    <Box boxSize="100%">
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[marker.lat, marker.lng]}
        zoom={17}
        preferCanvas={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
        />
        <FeatureGroup>
          <MapMarker
            markerColor={marker.ReportType.markerColor}
            center={{ lat: marker.lat, lng: marker.lng }}
          />
        </FeatureGroup>
      </MapContainer>
    </Box>
  )
}

const MapMarker = ({ markerColor, ...props }) => {
  const [color] = useToken('colors', [markerColor])
  return (
    <CircleMarker
      {...props}
      radius={6}
      pathOptions={{
        color,
        fillOpacity: 1,
        opacity: 0.3,
        weight: 16,
      }}
    />
  )
}
