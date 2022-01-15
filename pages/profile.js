import React from 'react'
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  LinkBox,
  LinkOverlay,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from '@chakra-ui/react'
import { formatDate } from '@/utils/functions'
import StatusIndicator from '@/components/common/StatusIndicator'
import NextLink from 'next/link'
import { apiGetReports } from '@/controllers/reports'
import Navbar from '@/components/global/Navbar'
import { getLoggedUser } from '@/controllers/auth'
import { useAuthUser } from '@/utils/react-query/user'
import { useGetReports } from '@/utils/react-query/reports'

export default function Profile(props) {
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useAuthUser()

  const {
    data: reports,
    isLoading: isReportsLoading,
    isError: isReportsError,
  } = useGetReports({ userId: user?.id })

  return (
    <Box>
      <Navbar user={user} />
      <Box mt="24">
        {!isUserLoading && user && (
          <Container maxW="container.lg">
            <Grid templateColumns={{ md: 'repeat(12, 1fr)' }} gap="6">
              <GridItem
                colStart={{ md: '2', xl: '3' }}
                colSpan={{ md: '10', xl: '8' }}
              >
                <Box mb="8">
                  <Heading as="h1" fontSize="3xl" fontWeight="semibold">
                    Welcome, {user.firstName}
                  </Heading>
                </Box>
                <Box>
                  {!isReportsLoading && reports ? (
                    <Box>
                      <Box mb="2">
                        <Heading as="h2" fontSize="xl" fontWeight="semibold">
                          Your Reports
                        </Heading>
                      </Box>
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
                                      {r.reportType.group} - {r.reportType.name}
                                    </Text>
                                  </LinkOverlay>
                                </NextLink>
                                <Box>
                                  <Text
                                    as="span"
                                    fontSize="sm"
                                    color="gray.600"
                                  >
                                    #{r.id} • Opened on{' '}
                                    {formatDate(r.createdAt)}
                                  </Text>
                                </Box>
                              </Box>
                            </Flex>
                          </LinkBox>
                        ))}
                      </Stack>
                    </Box>
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
          </Container>
        )}
      </Box>
    </Box>
  )
}

export async function getServerSideProps({ req }) {
  try {
    const user = await getLoggedUser(req)

    if (!user) {
      return {
        redirect: {
          destination: '/sign-in',
          permanent: false,
        },
      }
    }

    const reports = await apiGetReports({ userId: user.id })

    return {
      props: {
        reports,
        user,
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}
