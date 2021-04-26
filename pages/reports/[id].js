import { useRouter } from 'next/router'
import {
  AspectRatio,
  Avatar,
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  Square,
  Circle,
  Text,
  useToken,
  Tag,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react'
import Container from '@/components/common/Container'
import { supabase } from '@/utils/supabase'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import { getReport } from '@/utils/axios/reports'
import {
  setUniqueReport,
  useReportDispatch,
  useReportState,
} from '@/context/reports'
import Navbar from '@/components/common/global/Navbar'
import { formatDate, formatDateFromNow } from '@/utils/functions'
import { reportStatusType } from '@/utils/types'

export default function SingleReport() {
  const router = useRouter()
  const { id } = router.query
  const { unique } = useReportState()
  const dispatch = useReportDispatch()
  const [isReportLoading, setIsReportLoading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [imageSrc, setImageSrc] = useState('')

  const downloadImage = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('buffalo311')
        .createSignedUrl(
          'public/19f582fd-9351-487a-ac00-56347fc227f1.png',
          3600
        )
      if (error) {
        throw error
      }
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  const handleFetchReport = useCallback(async () => {
    try {
      setIsReportLoading(true)
      const data = await getReport(id)
      dispatch(setUniqueReport(data))
      setIsReportLoading(false)
    } catch (error) {
      setIsReportLoading(false)
      alert(error)
    }
  }, [dispatch, id])

  useEffect(() => {
    if (id) {
      // TODO: Remove this when using SSR
      handleFetchReport()
    }
  }, [handleFetchReport, id])

  const activities = [
    {
      type: 'comment',
      name: 'Lorem Ipsum',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ',
      createdAt: '2021-04-21T23:26:03.729727-04:00',
    },
    {
      type: 'update',
      attribute: 'status',
      newValue: 'Scheduled',
      oldValue: '',
      createdAt: '2021-04-21T23:26:03.729727-04:00',
    },
  ]

  const testImages = [
    '//via.placeholder.com/350x150',
    '//via.placeholder.com/150x150',
    '//via.placeholder.com/150x350',
  ]

  const handleOpenModal = (src) => {
    setImageSrc(src)
    onOpen()
  }

  return (
    <>
      <Head>
        <title>Open a Report</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Box mt="24">
        {unique && (
          <Container>
            <Grid templateColumns={{ lg: 'repeat(12, 1fr)' }} gap="6">
              <GridItem rowSpan="-1" colSpan="8">
                <Box borderBottomWidth="1px" pb="8" mb="8">
                  <Flex>
                    <Square rounded="lg" size="16" bg="blue.500"></Square>
                    <Box ml="4">
                      <Text as="span">
                        #{id} - {unique.reportType.group}
                      </Text>
                      <Heading as="h1" size="lg" fontWeight="semibold">
                        {unique.reportType.name}
                      </Heading>
                      <Text as="span">
                        Opened on {formatDate(unique.createdAt, 'MMM D, YYYY')}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </GridItem>
              <GridItem rowSpan="-1" colSpan="4">
                <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                  Status
                </Heading>
                <Box mb="4">
                  {unique.status === reportStatusType.CREATED && (
                    <Tag variant="subtle" colorScheme="green">
                      Open
                    </Tag>
                  )}
                </Box>
                <Box mb="4">
                  <Text fontWeight="medium">0 Comments</Text>
                </Box>
                <Box mb="4">
                  <Text fontWeight="medium">
                    Opened on{' '}
                    <time
                      dateTime={unique.createdAt}
                      title={formatDate(
                        unique.createdAt,
                        'MMM D, YYYY h:mm A z'
                      )}
                    >
                      {formatDate(unique.createdAt, 'MMM D, YYYY')}
                    </time>
                  </Text>
                </Box>
              </GridItem>
              <GridItem colSpan="8">
                <Box borderBottomWidth="1px" pb="8" mb="8">
                  <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                    Details
                  </Heading>
                  <Grid templateColumns={{ md: 'repeat(2, 1fr)' }} gap="6">
                    <GridItem colSpan="1">
                      <Box mb="12">
                        <Heading as="h3" size="md" fontWeight="medium" mb="2">
                          Photos
                        </Heading>
                        {testImages && testImages.length > 0 && (
                          <Grid templateColumns="repeat(2, 1fr)" gap="2">
                            {testImages.map((image, idx) => (
                              <GridItem key={idx}>
                                <AspectRatio ratio={4 / 3}>
                                  <Button
                                    d="block"
                                    w="100%"
                                    h="auto"
                                    p="0"
                                    onClick={() => handleOpenModal(image)}
                                  >
                                    <Image
                                      h="100%"
                                      w="100%"
                                      objectFit="cover"
                                      rounded="md"
                                      src={image}
                                    />
                                  </Button>
                                </AspectRatio>
                              </GridItem>
                            ))}
                          </Grid>
                        )}
                      </Box>
                      <Box>
                        <Heading as="h3" size="md" fontWeight="medium" mb="2">
                          Description
                        </Heading>
                        <Text>{unique.details}</Text>
                      </Box>
                    </GridItem>
                    <GridItem colSpan="1">
                      <Heading as="h3" size="md" fontWeight="medium">
                        Location
                      </Heading>
                    </GridItem>
                  </Grid>
                </Box>
              </GridItem>
              <GridItem colSpan="8">
                <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                  Activity
                </Heading>
                <ActivityList activities={activities} />
              </GridItem>
            </Grid>
          </Container>
        )}
      </Box>
      <Modal
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size="full"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent bg="transparent" position="relative">
          <ModalBody
            position="absolute"
            w="100%"
            h="100%"
            p="8"
            onClick={onClose}
          >
            <ModalCloseButton color="white" />
            <Image h="100%" w="100%" objectFit="contain" src={imageSrc} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const ActivityList = ({ activities }) => {
  const [gray50] = useToken('colors', ['gray.50'])
  return (
    <Box>
      {activities.map((a) =>
        a.type === 'update' ? (
          <Box pb="6">
            <Flex align="center">
              <Box flexShrink="0" w="12">
                <Circle
                  boxShadow={`0 0 0 6px ${gray50}`}
                  size="40px"
                  bg="gray.200"
                  color="white"
                  mx="auto"
                ></Circle>
              </Box>
              <Box ml="4">
                <Text as="span">Status changed to {a.newValue}</Text>
                <Text
                  as="time"
                  fontSize="sm"
                  dateTime={a.createdAt}
                  title={formatDate(a.createdAt, 'MMM D, YYYY h:mm A z')}
                  color="gray.500"
                  ml="2"
                >
                  {formatDateFromNow(a.createdAt)}
                </Text>
              </Box>
            </Flex>
          </Box>
        ) : (
          <Box pb="6" borderLeftWidth="2px" ml="6">
            <Flex ml="-6">
              <Box flexShrink="0" w="12">
                <Avatar
                  boxShadow={`0 0 0 6px ${gray50}`}
                  name={a.name}
                  src="https://bit.ly/broken-link"
                />
              </Box>
              <Box ml="4">
                <Box by="1">
                  <Text lineHeight="1.2" fontWeight="medium">
                    {a.name}
                  </Text>
                  <Text
                    as="time"
                    fontSize="sm"
                    dateTime={a.createdAt}
                    title={formatDate(a.createdAt, 'MMM D, YYYY h:mm A z')}
                    color="gray.500"
                  >
                    {formatDateFromNow(a.createdAt)}
                  </Text>
                </Box>
                <Text color="gray.700">{a.content}</Text>
              </Box>
            </Flex>
          </Box>
        )
      )}
    </Box>
  )
}

// buffalo311/public/2c6977b1-e3e8-4d31-83be-c34bd2d137f0.png
