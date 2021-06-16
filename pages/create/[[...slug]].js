import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import groupBy from 'lodash/groupBy'
import sampleSize from 'lodash/sampleSize'
import slugify from 'slugify'
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
  Icon,
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
  Spinner,
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
import Navbar from '@/components/global/Navbar'
import PhotoInput from '@/components/reportCreation/PhotoInput'
import GeocoderInput from '@/components/reportCreation/GeocoderInput'
import { createReport, useReportDispatch } from '@/context/reports'
import { postReport } from '@/utils/axios/reports'

import { supabase } from '@/utils/supabase'
import { uploadFile } from '@/utils/functions'

import {
  UilSearchAlt,
  UilAt,
  UilCamera,
  UilMapMarker,
  UilNotes,
} from '@iconscout/react-unicons'

const MapboxEmbed = dynamic(
  () => import('@/components/reportCreation/MapboxEmbed'),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
)

export default function Create({ reportTypes }) {
  const router = useRouter()
  const { query } = router
  const locationModal = useDisclosure()
  const dispatch = useReportDispatch()

  const [search, setSearch] = useState('')
  const [searchExamples, setSearchExamples] = useState([])

  const [reportType, setReportType] = useState(null)
  const [location, setLocation] = useState(null)
  const [details, setDetails] = useState('')
  const [images, setimages] = useState([])
  // const [anonymous, setAnonymous] = useState(false)
  const [latLng, setLatLng] = useState(null)
  const [email, setEmail] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredReportTypes = reportTypes
    ? reportTypes.filter((o) => {
        return o.name.toLowerCase().includes(search.toLowerCase())
      })
    : []

  const groupedReportTypes = groupBy(
    [...filteredReportTypes].sort((a, b) => (a.name > b.name ? 1 : -1)),
    (o) => o.group
  )

  if (process.browser && query.slug && !reportType) router.replace('/create')

  const handleSelection = (obj) => {
    setReportType(obj)
    const href = slugify(obj.name, { lower: true, strict: true })
    router.push(`/create/${href}`)
  }

  useEffect(() => {
    if (reportTypes) {
      setSearchExamples(
        sampleSize(
          reportTypes.map((o) => o.name),
          2
        )
      )
    }
  }, [setSearchExamples, reportTypes])

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const photoUrls = await Promise.all(
        images.map(async (image) => {
          const src = await uploadFile(image.fileName, image.file)
          return {
            blurDataURL: image.blurhash,
            src,
          }
          // Upload server side (not currently working)
          // const formData = new FormData()
          // formData.append('file', image.file, image.fileName)
          // const { data } = await axios.post('/api/uploads', formData)
          // return data
        })
      )

      const data = await postReport({
        reportTypeId: reportType.id,
        location,
        details,
        images: images && (photoUrls || []),
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
      </Head>
      <Box overflow="hidden">
        <Navbar />
        <Grid
          templateColumns={{ md: 'repeat(12, 1fr)' }}
          gap="6"
          pos="fixed"
          pt="16"
          px="6"
          top="0"
          height="100%"
          overflow="auto"
          width="100%"
        >
          {query.slug && reportType ? (
            <GridItem
              colStart={{ md: '3', xl: '4' }}
              colSpan={{ md: '8', xl: '6' }}
              py="4"
            >
              <Box bg="white" borderWidth="1px" rounded="md">
                <Box p="4" borderBottomWidth="1px">
                  <Text>{reportType.group}</Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {reportType.name}
                  </Text>
                </Box>
                <Stack spacing="4" p="4">
                  <Box>
                    <Flex align="center" mb="2">
                      <Icon as={UilMapMarker} boxSize="6" />
                      <Text fontWeight="medium" fontSize="lg" ml="1">
                        Location
                      </Text>
                      <Text
                        fontWeight="medium"
                        fontSize="sm"
                        ml="1"
                        color="gray.600"
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
                    <Flex align="center" mb="2">
                      <Icon as={UilCamera} boxSize="6" />
                      <Text fontWeight="medium" fontSize="lg" ml="2">
                        Photos
                      </Text>
                    </Flex>
                    <PhotoInput value={images} handleChange={setimages} />
                  </Box>
                  <Box>
                    <FormControl id="description">
                      <Flex as={FormLabel} align="center" fontSize="lg">
                        <Icon as={UilNotes} boxSize="6" />
                        <Text ml="2">Description/Details</Text>
                      </Flex>
                      <Textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        rows="5"
                        resize="none"
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="email">
                      <Flex as={FormLabel} align="center" fontSize="lg">
                        <Icon as={UilAt} boxSize="6" />
                        <Text ml="2">Email</Text>
                      </Flex>
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
              colStart={{ md: '3', xl: '4' }}
              colSpan={{ md: '8', xl: '6' }}
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
                        children={<Icon as={UilSearchAlt} boxSize="6" />}
                        pointerEvents="none"
                      />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        autoComplete="off"
                      />
                    </InputGroup>
                    {searchExamples.length > 0 && (
                      <FormHelperText>
                        {`Example: "${searchExamples[0]}" or "${searchExamples[1]}"`}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <Flex flexGrow="1" overflow="auto">
                  {reportTypes && reportTypes.length > 0 ? (
                    <Stack
                      width="100%"
                      direction="column"
                      spacing="0"
                      rounded="md"
                      overflow="auto"
                      borderWidth="1px"
                      divider={<StackDivider borderColor="gray.200" />}
                    >
                      {Object.keys(groupedReportTypes)
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
                            {groupedReportTypes[key]
                              .map((o, oIdx) => (
                                <Box
                                  key={oIdx}
                                  width="100%"
                                  px="2"
                                  as="button"
                                  textAlign="unset"
                                  p="2"
                                  _hover={{ bg: 'gray.100' }}
                                  onClick={() => handleSelection(o)}
                                >
                                  {o.name}
                                </Box>
                              ))
                              .sort()}
                          </Box>
                        ))}
                    </Stack>
                  ) : (
                    <Flex h="100%" w="100%" align="center" justify="center">
                      <Spinner />
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </GridItem>
          )}
        </Grid>
      </Box>
      <Modal isOpen={locationModal.isOpen} onClose={locationModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <LocationModal
            location={location}
            setLocation={setLocation}
            setLatLng={setLatLng}
            handleModalClose={locationModal.onClose}
          />
        </ModalContent>
      </Modal>
    </>
  )
}

const LocationModal = ({
  location,
  setLocation,
  setLatLng,
  handleModalClose,
}) => {
  const [locationInputValue, setLocationInputValue] = useState('')
  const [isFindingLocation, setIsfindingLocation] = useState(false)

  const getCurrentLocation = (e) => {
    e.preventDefault()
    setIsfindingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setIsfindingLocation(false)
          setLocation({
            lat,
            lng,
            accuracy: position.coords.accuracy,
            current: true,
          })
          setLatLng({
            lat,
            lng,
          })
          setLocationInputValue(
            `Lat: ${lat.toFixed(3)},` +
              ` Lng: ${lng.toFixed(3)}` +
              ' (Current Location)'
          )
        },
        (error) => {
          setIsfindingLocation(false)
          alert(`Error: (${error.code}) ${error.message}`)
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

  const getAddress = (address) => {
    const { lat, lng } = address
    setLocation(address)
    setLatLng({
      lat,
      lng,
    })
  }

  const getMapLocation = (latLng) => {
    const { lat, lng } = latLng
    setLocation({
      current: false,
      ...latLng,
    })
    setLatLng({
      lat,
      lng,
    })
    setLocationInputValue(
      `Lat: ${latLng.lat.toFixed(3)}, Lng: ${latLng.lng.toFixed(3)}`
    )
  }

  return (
    <>
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
                    handleSetLocation={getMapLocation}
                    latLng={
                      location && { lat: location.lat, lng: location.lng }
                    }
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
                      value={locationInputValue}
                      readOnly
                    />
                    <InputRightElement width="auto">
                      <Button
                        size="sm"
                        mr="1"
                        colorScheme="blue"
                        isLoading={isFindingLocation}
                        onClick={getCurrentLocation}
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
                <GeocoderInput onSelectAddress={getAddress} />
                <FormHelperText>
                  Select an option from the dropdown.
                </FormHelperText>
              </FormControl>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalBody>

      <ModalFooter d="flex" justifyContent="center">
        <Button colorScheme="blue" onClick={handleModalClose}>
          Save
        </Button>
      </ModalFooter>
    </>
  )
}

export async function getStaticPaths() {
  // const reportTypes = await getReportTypes()
  const { data: reportTypes, error } = await supabase
    .from('reportTypes')
    .select('*')

  if (!reportTypes || error) {
    return {
      notFound: true,
    }
  }

  const paths = reportTypes.map((type) => {
    const slug = [slugify(type.name, { lower: true, strict: true })]
    return { params: { slug } }
  })

  return { paths, fallback: true }
}

export async function getStaticProps() {
  // const reportTypes = await getReportTypes()
  const { data: reportTypes } = await supabase.from('reportTypes').select('*')

  return {
    props: {
      reportTypes,
    },
  }
}
