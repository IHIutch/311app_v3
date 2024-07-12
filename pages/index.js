import NextLink from 'next/link'
import Head from 'next/head'
import {
  GridItem,
  Stack,
  Text,
  Grid,
  Box,
  LinkBox,
  LinkOverlay,
  Flex,
  Icon,
  ButtonGroup,
  Button,
  useBoolean,
  useMediaQuery,
  useToken,
  Skeleton,
  SkeletonCircle,
  Container,
} from '@chakra-ui/react'
import * as Sentry from '@sentry/nextjs'
import { formatDate } from '@/utils/functions'
import Navbar from '@/components/global/Navbar'
import { UilMap, UilListUl, UilSlidersV } from '@iconscout/react-unicons'
import dynamic from 'next/dynamic'
import { apiGetReports } from '@/controllers/reports'
import StatusIndicator from '@/components/common/StatusIndicator'
import { useGetReports } from '@/utils/react-query/reports'
import { dehydrate, QueryClient } from 'react-query'
import DashboardMap from '@/components/dashboard/DashboardMap'

// const DashboardMap = dynamic(
//   () => import('@/components/dashboard/DashboardMap'),
//   {
//     // loading: () => <p>Loading...</p>,
//     ssr: false,
//   }
// )

export default function Home() {
  const [lgBreakpoint] = useToken('breakpoints', ['lg'])
  const [isLargerThanLg] = useMediaQuery(`(min-width: ${lgBreakpoint})`)
  const {
    data: reports,
    isLoading: isReportsLoading,
    isError: isReportsError,
  } = useGetReports()
  const [isShowingMapMobile, setIsShowingMapMobile] = useBoolean(false)

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box h="100%">
        <Navbar />
        <Flex
          position="sticky"
          zIndex="1"
          top="16"
          h="12"
          bg="gray.50"
          borderBottomWidth="1px"
          align="center"
        >
          <Container maxW="none" d="flex">
            <Box>
              <ButtonGroup size="sm" d={{ lg: 'none' }} isAttached>
                <Button
                  leftIcon={<Icon as={UilMap} boxSize="6" />}
                  variant={!isShowingMapMobile ? 'outline' : 'solid'}
                  colorScheme={isShowingMapMobile ? 'blue' : 'gray'}
                  onClick={setIsShowingMapMobile.on}
                >
                  Map View
                </Button>
                <Button
                  leftIcon={<Icon as={UilListUl} boxSize="6" />}
                  variant={isShowingMapMobile ? 'outline' : 'solid'}
                  colorScheme={!isShowingMapMobile ? 'blue' : 'gray'}
                  onClick={setIsShowingMapMobile.off}
                >
                  List View
                </Button>
              </ButtonGroup>
            </Box>
            <Box ml="auto">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={UilSlidersV} boxSize="5" />}
              >
                Filters
              </Button>
            </Box>
          </Container>
        </Flex>
        <Box position="fixed" top="0" pt="28" w="100%" h="100%">
          <Box h="100%" px="0">
            <Grid h="100%" w="100%" templateColumns={{ lg: 'repeat(2, 1fr)' }}>
              <GridItem
                boxSize="100%"
                borderRightWidth="1px"
                // d={{ base: isShowingMapMobile ? 'block' : 'none', lg: 'block' }}
              >
                {(isLargerThanLg || isShowingMapMobile) && (
                  <DashboardMap markers={Object.values(reports)} />
                )}
              </GridItem>
              <GridItem
                h="100%"
                overflow="auto"
                p="6"
                d={{ base: isShowingMapMobile ? 'none' : 'block', lg: 'block' }}
              >
                <Box>
                  {!isReportsLoading && reports ? (
                    <Stack dir="column" spacing="0">
                      {Object.values(reports).map((r, idx) => (
                        <LinkBox
                          key={idx}
                          p="3"
                          bg="white"
                          borderWidth="1px"
                          borderTopWidth={idx !== 0 && '0'}
                          borderTopRadius={idx === 0 && 'md'}
                          borderBottomRadius={
                            idx === Object.keys(reports).length - 1 && 'md'
                          }
                          transition="all ease 0.2s"
                          _hover={{ bg: 'gray.100' }}
                        >
                          <Flex>
                            <Box>
                              <StatusIndicator
                                status={r.status}
                                showText={false}
                              />
                            </Box>
                            <Box ml="2">
                              <NextLink passHref href={`/reports/${r.id}`}>
                                <LinkOverlay fontWeight="semibold">
                                  <Text lineHeight="1.4">
                                    {r.ReportType.group} - {r.ReportType.name}
                                  </Text>
                                </LinkOverlay>
                              </NextLink>
                              <Box>
                                <Text as="span" fontSize="sm" color="gray.600">
                                  #{r.id} • Opened on {formatDate(r.createdAt)}
                                </Text>
                              </Box>
                            </Box>
                          </Flex>
                        </LinkBox>
                      ))}
                    </Stack>
                  ) : (
                    <Stack dir="column" spacing="0">
                      {[...Array(12)].map((r, idx) => (
                        <Box
                          key={idx}
                          p="3"
                          bg="white"
                          borderWidth="1px"
                          _notFirst={{ borderTopWidth: '0' }}
                          _first={{
                            borderTopRadius: 'md',
                          }}
                          _last={{
                            borderBottomRadius: 'md',
                          }}
                        >
                          <Flex>
                            <SkeletonCircle size="6" />
                            <Box flexGrow="1" ml="2">
                              <Skeleton height="5" mb="3" maxW="96" />
                              <Skeleton
                                height="3"
                                w={{ base: '75%', lg: '25%' }}
                                maxW="48"
                              />
                            </Box>
                          </Flex>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </GridItem>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const queryClient = new QueryClient()
    const reports = await apiGetReports()

    await queryClient.prefetchQuery(['reports', null], async () => reports)

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
      },
    }
  } catch (error) {
    Sentry.captureException(error)
    return {
      notFound: true,
    }
  }
}
