import { useEffect, useState, useCallback } from 'react'
import axios from 'redaxios'
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
import Navbar from '@/components/common/global/navbar'
import PhotoInput from '@/components/reportCreation/PhotoInput'
import GeocoderInput from '@/components/reportCreation/GeocoderInput'
import { createReport, useReportDispatch } from '@/context/reports'
import { postReport } from '@/utils/api/reports'

import { getReportTypes } from '@/utils/api/reportTypes'

const MapboxEmbed = dynamic(
  () => import('@/components/reportCreation/MapboxEmbed'),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
)

export default function Create() {
  const router = useRouter()
  const { query } = router
  const locationModal = useDisclosure()
  const dispatch = useReportDispatch()

  const [search, setSearch] = useState('')
  const [searchExamples, setSearchExamples] = useState([])
  const [reportTypes, setReportTypes] = useState([])

  const [reportType, setReportType] = useState(null)
  const [location, setLocation] = useState(null)
  const [details, setDetails] = useState('')
  const [images, setimages] = useState([])
  // const [anonymous, setAnonymous] = useState(false)
  const [latLng, setLatLng] = useState(null)
  const [email, setEmail] = useState('')

  const [modalLocationValue, setModalLocationValue] = useState('')
  const [isFindingLocation, setIsfindingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredReportTypes = reportTypes.filter((o) => {
    return o.name.toLowerCase().includes(search.toLowerCase())
  })

  const groupedReportTypes = groupBy(
    [...filteredReportTypes].sort((a, b) => (a.name > b.name ? 1 : -1)),
    (o) => o.group
  )

  if (query.slug && !reportType) router.replace('/create')

  const handleGetReportTypes = useCallback(async () => {
    setReportTypes(await getReportTypes())
  }, [])

  useEffect(() => {
    if (!reportTypes.length) {
      handleGetReportTypes()
    }
    setSearchExamples(
      sampleSize(
        reportTypes.map((o) => o.name),
        2
      )
    )
  }, [setSearchExamples, reportTypes, handleGetReportTypes])

  const handleSelection = (obj) => {
    setReportType(obj)
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
          const formData = new FormData()
          formData.append('file', image.file, image.fileName)
          const { data } = await axios.post('/api/upload', formData)
          return data
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
            {query.slug && reportType ? (
              <GridItem
                colStart="2"
                colSpan="1"
                height="100%"
                overflow="hidden"
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
                      {searchExamples.length > 0 && (
                        <FormHelperText>
                          {`Example: "${searchExamples[0]}" or "${searchExamples[1]}"`}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  <Flex flexGrow="1" overflow="auto">
                    {reportTypes.length > 0 ? (
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
                              <Box
                                bg="gray.200"
                                px="2"
                                position="sticky"
                                top="0"
                              >
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
