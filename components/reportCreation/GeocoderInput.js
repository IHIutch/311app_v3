import { Box, Flex, Input, Text, Spinner } from '@chakra-ui/react'
import { useState } from 'react'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete'

export default function GeocoderInput({ onSelectAddress }) {
  const [value, setValue] = useState('')

  const handleSelect = async (address) => {
    try {
      const results = await geocodeByAddress(address)
      const latLng = await getLatLng(results[0])
      const addressObj = results[0].address_components.reduce(
        (acc, component) => {
          const key = component.types[0]
          acc[key] = component.long_name
          return acc
        },
        {}
      )
      onSelectAddress({
        ...addressObj,
        ...latLng,
      })
      setValue(results[0].formatted_address)
    } catch (err) {
      console.error('Error', err)
    }
  }

  return (
    <>
      <PlacesAutocomplete
        value={value}
        onChange={setValue}
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
              value={value}
              {...getInputProps({
                placeholder: 'Search Places ...',
              })}
            />
            {suggestions && suggestions.length > 0 && (
              <Box borderWidth="1px" rounded="md" shadow="md" overflow="hidden">
                {loading && (
                  <Box textAlign="center" h="8">
                    <Spinner size="sm" />
                  </Box>
                )}
                {suggestions.map((suggestion, idx) => {
                  return (
                    <Box
                      key={idx}
                      px="2"
                      py="1"
                      cursor="pointer"
                      _hover={{ bg: 'gray.100' }}
                      {...getSuggestionItemProps(suggestion)}
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
