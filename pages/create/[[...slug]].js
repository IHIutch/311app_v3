import { useEffect, useState, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import {
  AspectRatio,
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
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
  VisuallyHidden,
} from '@chakra-ui/react'
import groupBy from 'lodash/groupBy'
import sampleSize from 'lodash/sampleSize'
import Navbar from '@/components/common/global/navbar'
import slugify from 'slugify'
import PhotoInput from '@/components/reportCreation/PhotoInput'
import GeocoderInput from '@/components/reportCreation/GeocoderInput'
import { createReport, useReportDispatch } from '@/context/reports'
import { postReport } from '@/utils/api/reports'
import { uploadFile } from '@/utils/functions'

const MapboxEmbed = dynamic(
  () => import('@/components/reportCreation/MapboxEmbed'),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
)

export default function Create() {
  const locationModal = useDisclosure()

  const [search, setSearch] = useState('')
  const [searchExamples, setSearchExamples] = useState([])
  const [type, setType] = useState(null)
  const [location, setLocation] = useState(null)
  const [details, setDetails] = useState('')
  const [images, setimages] = useState([])
  // const [anonymous, setAnonymous] = useState(false)
  const [latLng, setLatLng] = useState(null)
  const [email, setEmail] = useState('')
  const [isFindingLocation, setIsfindingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dispatch = useReportDispatch()

  const options = useMemo(
    () => [
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
    ],
    []
  )

  const [modalLocationValue, setModalLocationValue] = useState('')

  const router = useRouter()
  const { query } = router

  const filteredOptions = options.filter((o) => {
    return o.name.toLowerCase().includes(search.toLowerCase())
  })

  const groupedOptions = groupBy(
    [...filteredOptions].sort((a, b) => (a.name > b.name ? 1 : -1)),
    (o) => o.group
  )

  if (query.slug && !type) router.replace('/create')

  useEffect(() => {
    setSearchExamples(
      sampleSize(
        options.map((o) => o.name),
        2
      )
    )
  }, [setSearchExamples, options, query, type, router])

  const handleSelection = (e, obj) => {
    e.preventDefault()
    setType(obj)
    const href = slugify(obj.name, { lower: true, strict: true })
    router.push(`/create/${href}`)
  }

  const handleFindLocation = (e) => {
    e.preventDefault()
    setIsfindingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsfindingLocation(false)
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            current: true,
          })
        },
        (error) => {
          setIsfindingLocation(false)
          alert(`ERROR(${error.code}): ${error.message}`)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    } else {
      alert('Not supported')
    }
  }

  useEffect(() => {
    location &&
      setLatLng({
        lat: location.lat,
        lng: location.lng,
      })
    setModalLocationValue(
      location && location.current
        ? '(Current Location)'
        : location && location.lng && location.lat
        ? `Lat: ${location.lat.toFixed(3)}, Lng: ${location.lng.toFixed(3)}`
        : ''
    )
  }, [location])

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const photoUrls = await Promise.all(
        images.map(async (image) => {
          return await uploadFile(image.file)
        })
      )

      const data = await postReport({
        reportTypeId: 1,
        location,
        details,
        images: photoUrls,
        lat: latLng.lat,
        lng: latLng.lng,
        email,
      })
      if (data.error) throw new Error(data.error)
      await dispatch(createReport(data))
      router.replace(`/reports/${data.id}`)
    } catch (error) {
      setIsSubmitting(false)
      alert(error)
    }
  }

  return (
    <>
      <Head>
        <title>Open a Report</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        ></script>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
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
            {query.slug && type ? (
              <GridItem
                colStart="2"
                colSpan="1"
                height="100%"
                overflow="hidden"
                py="4"
              >
                <Box bg="white" borderWidth="1px" rounded="md">
                  <Box p="4" borderBottomWidth="1px">
                    <Text>{type.group}</Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {type.name}
                    </Text>
                  </Box>
                  <Stack spacing="4" p="4">
                    <Box>
                      <Flex align="baseline" mb="1">
                        <Text fontWeight="medium">Location</Text>
                        <Text
                          fontWeight="medium"
                          fontSize="sm"
                          ml="1"
                          color="gray.500"
                        >
                          (Required)
                        </Text>
                      </Flex>
                      {location ? (
                        <Flex>
                          <Input
                            bg="gray.100"
                            color="gray.600"
                            value={
                              location && location.lat && location.lng
                                ? `Lat: ${location.lat.toFixed(
                                    3
                                  )}, Lng: ${location.lng.toFixed(3)}`
                                : ''
                            }
                            readOnly
                          />
                          <Button
                            ml="2"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={locationModal.onOpen}
                          >
                            Change
                          </Button>
                        </Flex>
                      ) : (
                        <Button
                          colorScheme="blue"
                          variant="outline"
                          onClick={locationModal.onOpen}
                          isFullWidth
                        >
                          Add Location
                        </Button>
                      )}
                    </Box>
                    <Box>
                      <Box mb="1">
                        <Text fontWeight="medium">Photos</Text>
                      </Box>
                      <PhotoInput value={images} handleChange={setimages} />
                    </Box>
                    <Box>
                      <FormControl id="description">
                        <FormLabel>Description/Details</FormLabel>
                        <Textarea
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Here is a sample placeholder"
                          rows="5"
                          resize="none"
                        />
                      </FormControl>
                    </Box>
                    <Box>
                      <FormControl id="email">
                        <FormLabel>Email Address</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <FormHelperText>
                          Enter your email to get updates about your report.
                        </FormHelperText>
                      </FormControl>
                    </Box>
                  </Stack>
                  <Box p="4" borderTopWidth="1px">
                    <Button
                      colorScheme="blue"
                      isLoading={isSubmitting}
                      loadingText="Submitting..."
                      isFullWidth
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  </Box>
                </Box>
              </GridItem>
            ) : (
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
                        <InputLeftElement pointerEvents="none" />
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
                                  onClick={(e) => handleSelection(e, o)}
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
            )}
          </Grid>
        </Box>
      </Box>
      <Modal isOpen={locationModal.isOpen} onClose={locationModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Location</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Tabs isFitted>
              <TabList mb="1em">
                <Tab>Use Map</Tab>
                <Tab>Use Address</Tab>
              </TabList>
              <TabPanels>
                <TabPanel p="0">
                  <Box>
                    <AspectRatio
                      w="100%"
                      ratio={16 / 9}
                      bg="gray.100"
                      mb="4"
                      rounded="md"
                    >
                      <MapboxEmbed
                        handleSetLocation={setLocation}
                        location={location}
                      />
                    </AspectRatio>
                    <FormControl id="chooseLocation">
                      <FormLabel>
                        <VisuallyHidden>Choose a Location</VisuallyHidden>
                      </FormLabel>
                      <InputGroup size="md">
                        <Input
                          bg="gray.100"
                          color="gray.600"
                          value={modalLocationValue}
                          readOnly
                        />
                        <InputRightElement width="auto">
                          <Button
                            size="sm"
                            mr="1"
                            colorScheme="blue"
                            isLoading={isFindingLocation}
                            onClick={handleFindLocation}
                          >
                            Find
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      <FormHelperText>
                        Click a point on the map or use your current location.
                      </FormHelperText>
                    </FormControl>
                  </Box>
                </TabPanel>
                <TabPanel p="0">
                  <FormControl id="addressSearch">
                    <FormLabel>Search for an Address</FormLabel>
                    <GeocoderInput handleSetLocation={setLocation} />
                    <FormHelperText>
                      Select an option from the dropdown.
                    </FormHelperText>
                  </FormControl>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter d="flex" justifyContent="center">
            <Button colorScheme="blue" onClick={locationModal.onClose}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
