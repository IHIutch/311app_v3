import { Box, Input, Text } from '@chakra-ui/react'
import { useState } from 'react'
import PlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from 'react-places-autocomplete'

export default function GeocoderInput() {
  const [location, setLocation] = useState(null)
  const handleChange = (address) => {
    console.log(address)
    setLocation(address)
  }

  const handleSelect = async (address) => {
    try {
      const results = await geocodeByAddress(address)
      console.log(results)
      const latLng = await getLatLng(results[0])
      //   setLocation(results[0].formatted_address)
      console.log('Success', latLng)
    } catch (err) {
      console.error('Error', err)
    }
  }

  return (
    <>
      <PlacesAutocomplete
        value={location}
        onChange={handleChange}
        onSelect={handleSelect}
        searchOptions={{
          // eslint-disable-next-line no-undef
          location: new google.maps.LatLng(42.886448, -78.878372),
          radius: 1000,
          types: ['address'],
        }}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <Box>
            <Input
              {...getInputProps({
                placeholder: 'Search Places ...',
              })}
            />
            {suggestions && suggestions.length > 0 && (
              <Box borderWidth="1px" rounded="md" shadow="md" overflow="hidden">
                {loading && (
                  <Box>
                    <Text>Loading...</Text>
                  </Box>
                )}
                {suggestions.map((suggestion) => {
                  // inline style for demonstration purpose
                  //   const style = suggestion.active
                  //     ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  //     : { backgroundColor: '#ffffff', cursor: 'pointer' }
                  return (
                    <Box
                      px="2"
                      py="1"
                      cursor="pointer"
                      _hover={{ bg: 'gray.100' }}
                      {...getSuggestionItemProps(suggestion, {
                        // style,
                      })}
                    >
                      <Text>{suggestion.description}</Text>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        )}
      </PlacesAutocomplete>
    </>
  )
}
