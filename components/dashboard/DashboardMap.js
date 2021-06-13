import React, { useEffect, useRef, useState } from 'react'
import { Box, Text, useToken, Link, Flex, Icon } from '@chakra-ui/react'
import NextLink from 'next/link'
import {
  CircleMarker,
  FeatureGroup,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { reportStatusType } from '@/utils/types'
import { UilLockOpenAlt } from '@iconscout/react-unicons'
import { formatDate } from '@/utils/functions'

export default function DashboardMap({ isShowing, markers }) {
  const [popup, setPopup] = useState(null)
  const handleMarkerClick = (data) => {
    setPopup(data)
  }

  const map = useMap

  return (
    <Box
      boxSize="100%"
      sx={{
        '.leaflet-popup-content-wrapper': {
          rounded: 'md',
          shadow: 'lg',
        },
        '.leaflet-popup-content': {
          m: '0',
          p: '4',
        },
      }}
    >
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[42.886, -78.879]}
        zoom={13}
        preferCanvas={true}
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
        />
        <FeatureGroup>
          {markers &&
            markers.map((m, idx) => (
              <MapMarker
                key={idx}
                markerColor={m.reportType.markerColor}
                center={{ lat: m.lat, lng: m.lng }}
                radius={6}
                markerClickHandler={() => handleMarkerClick(m)}
              />
            ))}

          <Popup>
            {popup && (
              <Box>
                <Box mb="3">
                  {popup.status === reportStatusType.CREATED && (
                    <Flex color="green" align="center">
                      <Icon boxSize="5" as={UilLockOpenAlt} />
                      <Text as="span" fontSize="sm" fontWeight="medium" ml="1">
                        Open
                      </Text>
                    </Flex>
                  )}
                </Box>
                <Box mb="4">
                  <Text
                    sx={{
                      '&&': {
                        fontWeight: 'medium',
                        fontSize: 'md',
                        m: '0',
                        mb: '1',
                        color: 'black',
                      },
                    }}
                  >
                    {popup.reportType.group} - {popup.reportType.name}
                  </Text>
                  <Text as="span" fontSize="sm" color="gray.600">
                    #{popup.id} • Opened on {formatDate(popup.createdAt)}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <NextLink passHref href={`reports/${popup.id}`}>
                    <Link
                      sx={{
                        '&&': {
                          color: 'blue.500',
                          fontSize: 'md',
                          fontWeight: 'medium',
                        },
                      }}
                    >
                      View Report
                    </Link>
                  </NextLink>
                </Box>
              </Box>
            )}
          </Popup>
        </FeatureGroup>
      </MapContainer>
    </Box>
  )
}

const MapMarker = ({ markerColor, markerClickHandler, ...props }) => {
  const map = useMap()
  const handleClick = (latlng) => {
    map.flyTo(latlng, map.getZoom())
    markerClickHandler()
  }

  const [color] = useToken('colors', [markerColor])
  return (
    <CircleMarker
      {...props}
      eventHandlers={{
        click: (e) => handleClick(e.latlng),
      }}
      pathOptions={{
        color,
        fillOpacity: 1,
        opacity: 0.3,
        weight: 10,
      }}
    />
  )
}
