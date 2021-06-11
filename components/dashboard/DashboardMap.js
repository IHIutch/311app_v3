import Head from 'next/head'
import React from 'react'
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet'

export default function DashboardMap({ markers }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
          key="leafletCss"
        />
      </Head>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[42.886, -78.879]}
        zoom={13}
        preferCanvas={true}
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
        />
        {markers &&
          markers.map((m, idx) => (
            <CircleMarker
              key={idx}
              center={{ lat: m.lat, lng: m.lng }}
              radius={6}
              eventHandlers={{
                click: () => {
                  console.log(m)
                },
              }}
              pathOptions={{
                color: 'blue',
                fillOpacity: 1,
                opacity: 0.2,
                weight: 10,
              }}
            />
          ))}
      </MapContainer>
    </>
  )
}
