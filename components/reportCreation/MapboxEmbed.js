import { useCallback, useState } from 'react'
import { Box, Text } from '@chakra-ui/react'
import ReactMapGL, {
  Popup,
  FlyToInterpolator,
  AttributionControl,
} from 'react-map-gl'

export default function MapboxEmbed() {
  const [viewport, setViewport] = useState({
    width: '100%',
    height: '100%',
    latitude: 42.8864,
    longitude: -78.8784,
    zoom: 14,
  })
  const [isShowingPopup, setIsShowingPopup] = useState(false)
  const [popup, setPopup] = useState(null)
  const handleClick = useCallback(
    (e) => {
      const [lng, lat] = e.lngLat
      setPopup({
        lng,
        lat,
      })
      setIsShowingPopup(true)
      setViewport({
        ...viewport,
        longitude: lng,
        latitude: lat,
        transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
        transitionDuration: 'auto',
      })
    },
    [viewport]
  )

  return (
    <>
      <Box position="absolute" top="0" right="0" bottom="0" left="0">
        <ReactMapGL
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxApiAccessToken="pk.eyJ1IjoiamJodXRjaCIsImEiOiJjamRqZGU1eTYxMTZlMzNvMjV2dGxzdG8wIn0.IAAk5wKeLXOUaQ4QYF3sEA"
          {...viewport}
          onViewportChange={(nextViewport) => setViewport(nextViewport)}
          onClick={handleClick}
        >
          {isShowingPopup && (
            <>
              <Popup
                latitude={popup.lat}
                longitude={popup.lng}
                closeButton={false}
                closeOnClick={false}
              >
                <Text fontSize="sm">
                  Latitude: {popup.lat.toFixed(3)}, Longitude:{' '}
                  {popup.lng.toFixed(3)}
                </Text>
              </Popup>
            </>
          )}
        </ReactMapGL>
      </Box>
    </>
  )
}
