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

export default function SingleReport() {
  const router = useRouter()
  const { id } = router.query
  const { unique } = useReportState()
  const dispatch = useReportDispatch()
  const [isReportLoading, setIsReportLoading] = useState(false)

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
            <Grid templateColumns="repeat(12, 1fr)" gap="6">
              <GridItem colSpan="8">
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
                      <Text as="span">Opened on {unique.createdAt}</Text>
                    </Box>
                  </Flex>
                </Box>
                <Box borderBottomWidth="1px" pb="8" mb="8">
                  <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                    Details
                  </Heading>
                  <Grid templateColumns="repeat(3, 1fr)" gap="6">
                    <GridItem colSpan="2">
                      <Box mb="12">
                        <Heading as="h3" size="md" fontWeight="medium" mb="2">
                          Photos
                        </Heading>
                        {unique.images && unique.images.length > 0 && (
                          <Grid templateColumns="repeat(4, 1fr)" gap="2">
                            {unique.images.map((image) => (
                              <GridItem>
                                <AspectRatio ratio={4 / 3}>
                                  <Image
                                    h="100%"
                                    w="100%"
                                    objectFit="cover"
                                    rounded="lg"
                                    src="https://via.placeholder.com/150"
                                  />
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
                <Box>
                  <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                    Activity
                  </Heading>
                  <ActivityList activities={activities} />
                </Box>
              </GridItem>
              <GridItem colSpan="4">
                <Box>
                  <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                    Status
                  </Heading>
                  {unique.status}
                </Box>
                <Box>0 Comments</Box>
                <Box>Opened on {unique.createdAt}</Box>
              </GridItem>
            </Grid>
          </Container>
        )}
      </Box>
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
                  title={a.createdAt}
                  color="gray.500"
                  ml="2"
                >
                  {a.createdAt}
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
                    title={a.createdAt}
                    color="gray.500"
                  >
                    {a.createdAt}
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
