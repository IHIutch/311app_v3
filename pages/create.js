import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  StackDivider,
  Text,
} from '@chakra-ui/react'
import groupBy from 'lodash/groupBy'
import sampleSize from 'lodash/sampleSize'
import Head from 'next/head'
import { useState } from 'react'
import Navbar from '../components/common/global/navbar'

export default function Create() {
  const [search, setSearch] = useState('')
  const options = [
    {
      department: 'Police',
      group: 'Quality of Life',
      name: 'Noise Complaint',
    },
    {
      department: 'Parking',
      group: 'Parking/Vehicles',
      name: 'Illegal Parking',
    },
    {
      department: 'Parking',
      group: 'Parking/Vehicles',
      name: 'Blocked Driveway',
    },
    {
      department: 'Parking',
      group: 'Parking/Vehicles',
      name: 'Damaged/Faulty Parking Meter',
    },
    {
      department: 'Public Works',
      group: 'Streets',
      name: 'Signal Out or Flashing',
    },
    {
      department: 'Public Works',
      group: 'Streets',
      name: 'Signal Timing Issue',
    },
    {
      department: 'Public Works',
      group: 'Streets',
      name: 'Sneakers Hanging',
    },
    {
      department: 'Public Works',
      group: 'Streets',
      name: 'Damaged Street Sign',
    },
    {
      department: 'Public Works',
      group: 'Streets',
      name: 'Missing Manhole Cover',
    },
    {
      department: 'Public Works',
      group: 'Streets',
      name: 'Unplowed Street',
    },
    {
      department: 'Public Works',
      group: 'Sidewalks',
      name: 'Uneven/Cracked',
    },
    {
      department: 'Public Works',
      group: 'Sidewalks',
      name: 'Sidewalk Obstruction',
    },
    {
      department: 'Public Works',
      group: 'Sidewalks',
      name: 'Unshoveled Sidewalk',
    },
    {
      department: 'Public Works',
      group: 'Trees/Forestry',
      name: 'Fallen Tree',
    },
    {
      department: 'Public Works',
      group: 'Trees/Forestry',
      name: 'Tree/Stump Removal',
    },
    {
      department: 'Public Works',
      group: 'Trees/Forestry',
      name: 'Tree Trimming',
    },
    {
      department: 'Public Works',
      group: 'Trees/Forestry',
      name: 'Tree Planting',
    },
    {
      department: 'Public Works',
      group: 'Garbage/Sanitation',
      name: 'Graffiti',
    },
    {
      department: 'Public Works',
      group: 'Garbage/Sanitation',
      name: 'Request Street Sweeper',
    },
    {
      department: 'Public Works',
      group: 'Garbage/Sanitation',
      name: 'Request Leaf/Yard Debris Pickup',
    },
    {
      department: 'Public Works',
      group: 'Garbage/Sanitation',
      name: 'Damage from Street Worker',
    },
    {
      department: 'Public Works',
      group: 'Garbage/Sanitation',
      name: 'Illegal Garbage Dumping',
    },
    {
      department: 'Public Works',
      group: 'Garbage/Sanitation',
      name: 'Litter',
    },
    {
      department: 'Fire',
      group: 'Utility',
      name: 'Fire Hydrant Issue',
    },
    {
      department: 'Utility',
      group: 'Utility',
      name: 'Damaged/Faulty Street Light',
    },
    {
      department: 'Public Works',
      group: 'Utility',
      name: 'Snow on Hydrant',
    },
    {
      department: 'Housing Authority',
      group: 'Housing',
      name: 'Lead Paint Inspection',
    },
    {
      department: 'Police',
      group: 'Animal',
      name: 'Pet Nuisance',
    },
    {
      department: 'Public Works',
      group: 'Animal',
      name: 'Pest/Rodent',
    },
    {
      department: 'Public Works',
      group: 'Animal',
      name: 'Dead Animal Removal',
    },
  ]
  const filteredOptions = options.filter((o) => {
    return o.name.toLowerCase().includes(search.toLowerCase())
  })

  const groupedOptions = groupBy(
    [...filteredOptions].sort((a, b) => (a.name > b.name ? 1 : -1)),
    (o) => o.group
  )
  const searchExamples = sampleSize(
    options.map((o) => o.name),
    2
  )

  return (
    <>
      <Head>
        <title>Open a Report</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box overflow="hidden">
        <Navbar />
        <Box>
          <Grid
            templateColumns="repeat(3, 1fr)"
            gap="6"
            pos="fixed"
            pt="16"
            top="0"
            height="100%"
            width="100%"
          >
            <GridItem
              colStart="2"
              colSpan="1"
              height="100%"
              overflow="hidden"
              py="4"
            >
              <Flex
                bg="white"
                borderWidth="1px"
                rounded="md"
                p="4"
                height="100%"
                direction="column"
              >
                <Box mb="4">
                  <FormControl id="search">
                    <FormLabel>Select a Report Type</FormLabel>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        // children={}
                      />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        autoComplete="off"
                      />
                    </InputGroup>
                    <FormHelperText>
                      {`Example: "${searchExamples[0]}" or "${searchExamples[1]}"`}
                    </FormHelperText>
                  </FormControl>
                </Box>
                <Flex flexGrow="1" overflow="auto">
                  <Stack
                    width="100%"
                    direction="column"
                    spacing="0"
                    rounded="md"
                    overflow="auto"
                    borderWidth="1px"
                    divider={<StackDivider borderColor="gray.200" />}
                  >
                    {Object.keys(groupedOptions)
                      .sort()
                      .map((key, idx) => (
                        <Box key={idx}>
                          <Box bg="gray.200" px="2" position="sticky" top="0">
                            <Text
                              fontWeight="semibold"
                              textTransform="uppercase"
                            >
                              {key}
                            </Text>
                          </Box>
                          {groupedOptions[key]
                            .map((o, oIdx) => (
                              <Box
                                key={oIdx}
                                width="100%"
                                px="2"
                                as="button"
                                textAlign="unset"
                                p="2"
                                _hover={{ bg: 'gray.100' }}
                              >
                                {o.name}
                              </Box>
                            ))
                            .sort()}
                        </Box>
                      ))}
                  </Stack>
                </Flex>
              </Flex>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </>
  )
}
