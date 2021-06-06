import { useCallback, useEffect, useState } from 'react'
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
  Heading,
  ButtonGroup,
  Button,
  IconButton,
} from '@chakra-ui/react'
import Container from '@/components/common/Container'
import {
  setReports,
  useReportDispatch,
  useReportState,
} from '@/context/reports'
import { getReports } from '@/utils/axios/reports'
import { formatDate } from '@/utils/functions'
import Navbar from '@/components/global/Navbar'
import { reportStatusType } from '@/utils/types'

import { UilLockOpenAlt, UilMap, UilListUl } from '@iconscout/react-unicons'

export default function Home() {
  const { data: reports } = useReportState()
  const dispatch = useReportDispatch()
  const [isReportsLoading, setIsReportsLoading] = useState(false)

  const handleFetchReports = useCallback(async () => {
    try {
      setIsReportsLoading(true)
      const data = await getReports()
      dispatch(setReports(data))
      setIsReportsLoading(false)
    } catch (error) {
      setIsReportsLoading(false)
      alert(error)
    }
  }, [dispatch])

  useEffect(() => {
    handleFetchReports()
  }, [handleFetchReports])

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Navbar />
        <Box
          position="sticky"
          zIndex="1"
          top="16"
          bg="white"
          borderBottomWidth="1px"
          py="4"
        >
          <Container fluid>
            <Heading as="h1" fontSize="2xl">
              Reports
            </Heading>
            <Box ml="auto">
              <ButtonGroup size="sm" d={{ lg: 'none' }} isAttached>
                <IconButton
                  variant="outline"
                  aria-label="Map View"
                  icon={<Icon as={UilMap} boxSize="6" />}
                  p="2"
                />
                <IconButton
                  aria-label="List View"
                  icon={<Icon as={UilListUl} boxSize="6" />}
                  p="2"
                  colorScheme="blue"
                />
              </ButtonGroup>
            </Box>
          </Container>
        </Box>
        <Container fluid>
          <Grid
            w="100%"
            py="6"
            templateColumns={{ lg: 'repeat(2, 1fr)' }}
            gap="6"
          >
            <GridItem></GridItem>
            <GridItem>
              <Box
                bg="white"
                // p="3"
                // borderWidth="1px"
                rounded="md"
              >
                {reports && (
                  <Stack dir="column" spacing="0">
                    {Object.values(reports).map((r, idx) => (
                      <LinkBox
                        key={idx}
                        p="3"
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
                            {r.status === reportStatusType.CREATED && (
                              <Icon
                                color="green"
                                boxSize="6"
                                as={UilLockOpenAlt}
                              />
                            )}
                          </Box>
                          <Box ml="2">
                            <NextLink passHref href={`reports/${r.id}`}>
                              <LinkOverlay fontWeight="semibold">
                                <Text lineHeight="1.4">
                                  {r.reportType.group} - {r.reportType.name}
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
                )}
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </>
  )
}
