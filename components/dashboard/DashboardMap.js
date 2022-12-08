import React, { useState } from 'react'
import { Box, Text, useToken, Link, Flex, Icon } from '@chakra-ui/react'
import NextLink from 'next/link'
// import {
//   CircleMarker,
//   FeatureGroup,
//   MapContainer,
//   Popup,
//   TileLayer,
//   useMap,
//   ZoomControl,
// } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css'
import { UilMapMarker } from '@iconscout/react-unicons'
import { formatDate } from '@/utils/functions'
import StatusIndicator from '@/components/common/StatusIndicator'
import { Map, Marker, Overlay, ZoomControl } from 'pigeon-maps'

export default function DashboardMap({ markers }) {
  const [popup, setPopup] = useState(null)
  const handleMarkerClick = (data) => {
    setPopup(data)
  }

  const mapTiler = (x, y, z, dpr) => {
    console.log(dpr)
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/${z}/${x}/${y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
  }

  return (
    <Box
      boxSize="100%"
      // sx={{
      //   '.leaflet-popup-content-wrapper': {
      //     rounded: 'md',
      //     shadow: 'lg',
      //     p: '0',
      //     overflow: 'hidden',
      //   },
      //   '.leaflet-popup-content': {
      //     m: '0',
      //     p: '0',
      //   },
      //   '&& .leaflet-popup-close-button': {
      //     d: 'flex',
      //     alignItems: 'center',
      //     justifyContent: 'center',
      //     boxSize: '6',
      //     p: '4',
      //   },
      // }}
    >
      <Map
        defaultCenter={[42.886, -78.879]}
        defaultZoom={13}
        provider={mapTiler}
        attributionPrefix={
          <span>
            Imagery ©{' '}
            <a
              style={{ color: 'rgb(0, 120, 168)', textDecoration: 'none' }}
              href="https://www.mapbox.com/"
            >
              Mapbox
            </a>
          </span>
        }
      >
        <ZoomControl
          style={{ left: 'unset', right: 10, top: 10, zIndex: 100 }}
        />
        {popup ? (
          <Overlay
            anchor={[popup.anchor[0], popup.anchor[1]]}
            offset={[144, 240]}
            style={{ zIndex: 1 }}
          >
            <Box
              p="4"
              borderTopColor={popup.reportType.markerColor || 'black'}
              borderTopWidth="6px"
              bg="white"
              rounded="md"
              shadow="lg"
              w="72"
            >
              <Box mb="4">
                <StatusIndicator size="sm" status={popup.status} />
              </Box>
              <Box mb="4">
                <Text as="span" fontSize="sm" color="gray.600">
                  #{popup.id} • Opened on {formatDate(popup.createdAt)}
                </Text>
                <Text
                  fontWeight="medium"
                  fontSize="md"
                  m="0"
                  mb="1"
                  color="black"
                >
                  {popup.reportType.group} - {popup.reportType.name}
                </Text>
                <Flex
                  align="center"
                  color="gray.600"
                  fontWeight="medium"
                  mb="1"
                >
                  <Icon boxSize="4" as={UilMapMarker} />
                  <Text as="span" ml="1" fontSize="sm">
                    {popup.lat.toFixed(3)}, {popup.lng.toFixed(3)}
                  </Text>
                </Flex>
              </Box>
              <Box textAlign="right">
                <NextLink passHref href={`reports/${popup.id}`}>
                  <Link fontSize="sm" color="blue.500" fontWeight="semibold">
                    View Report
                  </Link>
                </NextLink>
              </Box>
            </Box>
          </Overlay>
        ) : null}
        {markers.map((m, idx) => (
          <MapMarker
            key={idx}
            width={25}
            anchor={[m.lat, m.lng]}
            color={m.reportType.markerColor}
            onClick={(anchor) => handleMarkerClick({ ...m, anchor })}
          />
          // <MapMarker
          //   key={idx}
          //   markerColor={m.reportType.markerColor}
          //   center={{ lat: m.lat, lng: m.lng }}
          //   markerClickHandler={() => handleMarkerClick(m)}
          // />
        ))}
      </Map>
      {/* <MapContainer
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
        {markers ? (
          <FeatureGroup>
            {markers.map((m, idx) => (
              <MapMarker
                key={idx}
                markerColor={m.reportType.markerColor}
                center={{ lat: m.lat, lng: m.lng }}
                markerClickHandler={() => handleMarkerClick(m)}
              />
            ))}

            <Popup>
              {popup ? (
                <Box
                  p="4"
                  borderTopColor={popup.reportType.markerColor}
                  borderTopWidth="6px"
                >
                  <Box mb="4">
                    <StatusIndicator size="sm" status={popup.status} />
                  </Box>
                  <Box mb="4">
                    <Flex
                      align="center"
                      color="gray.600"
                      fontWeight="medium"
                      mb="1"
                    >
                      <Icon boxSize="4" as={UilMapMarker} />
                      <Text as="span" ml="1" fontSize="sm">
                        {popup.lat.toFixed(3)}, {popup.lng.toFixed(3)}
                      </Text>
                    </Flex>
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
              ) : null}
            </Popup>
          </FeatureGroup>
        ) : null}
      </MapContainer> */}
    </Box>
  )
}

const MapMarker = ({ color, onClick, ...props }) => {
  // const handleClick = (latlng) => {
  //   // map.flyTo(latlng, map.getZoom())
  //   markerClickHandler()
  // }

  const markerColor = useToken('colors', color)
  return (
    <Marker
      {...props}
      color={markerColor || 'black'}
      onClick={(e) => onClick(e.anchor)}
      // radius={4}
      // pathOptions={{
      //   color: markerColor,
      //   fillOpacity: 1,
      //   opacity: 0.3,
      //   weight: 10,
      // }}
    />
  )
}
