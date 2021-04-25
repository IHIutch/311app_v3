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
} from '@chakra-ui/react'
import Container from '@/components/common/Container'
import {
  setReports,
  useReportDispatch,
  useReportState,
} from '@/context/reports'
import { getReports } from '@/utils/axios/reports'
import { formatDate } from '@/utils/functions'
import Navbar from '@/components/common/global/navbar'

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
        <Container>
          <Grid py="6" templateColumns="repeat(2, 1fr)" gap="6">
            <GridItem colStart="2">
              <Box bg="white" p="3" rounded="md" borderWidth="1px">
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
                        <NextLink passHref href={`reports/${r.id}`}>
                          <LinkOverlay fontWeight="semibold">
                            {r.reportType.group} - {r.reportType.name}
                          </LinkOverlay>
                        </NextLink>
                        <Box>
                          <Text as="span" fontSize="sm" color="gray.500">
                            #{r.id} • Opened on {formatDate(r.createdAt)}
                          </Text>
                        </Box>
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
