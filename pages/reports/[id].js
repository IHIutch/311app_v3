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
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Spinner,
  FormControl,
  FormHelperText,
  FormLabel,
  Textarea,
} from '@chakra-ui/react'
import Container from '@/components/common/Container'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import { getReport } from '@/utils/axios/reports'
import {
  setUniqueReport,
  useReportDispatch,
  useReportState,
} from '@/context/reports'
import {
  setComments,
  createComment,
  useCommentDispatch,
  useCommentState,
} from '@/context/comments'
import Navbar from '@/components/global/Navbar'
import { downloadFile, formatDate, formatDateFromNow } from '@/utils/functions'
import { commentType, reportStatusType } from '@/utils/types'
import { getComments, postComment } from '@/utils/axios/comments'

export default function SingleReport() {
  const router = useRouter()
  const { id } = router.query
  const { unique: report } = useReportState()
  const { data: comments } = useCommentState()
  const reportsDispatch = useReportDispatch()
  const commentsDispatch = useCommentDispatch()
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [activities, setActivities] = useState([])
  const modalState = useDisclosure()

  const [modalType, setModalType] = useState(null)
  const [images, setImages] = useState([])

  const handleFetchReport = useCallback(async () => {
    try {
      setIsLoadingReport(true)
      const data = await getReport(id)
      reportsDispatch(setUniqueReport(data))
      setIsLoadingReport(false)
    } catch (error) {
      setIsLoadingReport(false)
      alert(error)
    }
  }, [reportsDispatch, id])

  const handleFetchComments = useCallback(async () => {
    try {
      setIsLoadingComments(true)
      const data = await getComments({
        objectType: commentType.REPORT,
        objectId: id,
      })
      commentsDispatch(setComments(data))
      setIsLoadingComments(false)
    } catch (error) {
      setIsLoadingComments(false)
      alert(error)
    }
  }, [commentsDispatch, id])

  useEffect(() => {
    if (id) {
      // TODO: Remove this when using SSR
      handleFetchReport()
      handleFetchComments()
    }
  }, [handleFetchReport, handleFetchComments, id])

  useEffect(() => {
    if (report && report.images && report.images.length) {
      const handleGetFileUrls = async () => {
        const imageUrls = await Promise.all(
          report.images.map(async (img) => {
            const url = await downloadFile(img)
            return {
              path: img,
              url,
            }
          })
        )
        setImages(imageUrls)
      }
      handleGetFileUrls()
    }
  }, [report])

  useEffect(() => {
    const commentsList = Object.values(comments)
    const mergeActivities = [
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
    ].concat(commentsList)
    setActivities(mergeActivities)
  }, [comments])

  const handleOpenModal = (src) => {
    setModalType(
      <ImageModal imageSrc={src} handleModalClose={modalState.onClose} />
    )
    modalState.onOpen()
  }

  return (
    <>
      <Head>
        <title>Open a Report</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Box mt="24">
        {report && (
          <Container>
            <Grid templateColumns={{ lg: 'repeat(12, 1fr)' }} gap="6">
              <GridItem colSpan="8">
                <Box borderBottomWidth="1px" pb="8" mb="8">
                  <Flex>
                    <Square rounded="lg" size="16" bg="blue.500"></Square>
                    <Box ml="4">
                      <Text as="span">
                        #{id} • {report.reportType.group}
                      </Text>
                      <Heading as="h1" size="lg" fontWeight="semibold">
                        {report.reportType.name}
                      </Heading>
                      <Text as="span">
                        Opened on {formatDate(report.createdAt, 'MMM D, YYYY')}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </GridItem>
              <GridItem rowSpan={{ lg: '3' }} colSpan="4">
                <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                  Status
                </Heading>
                <Box mb="4">
                  {report.status === reportStatusType.CREATED && (
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
                      dateTime={report.createdAt}
                      title={formatDate(
                        report.createdAt,
                        'MMM D, YYYY h:mm A z'
                      )}
                    >
                      {formatDate(report.createdAt, 'MMM D, YYYY')}
                    </time>
                  </Text>
                </Box>
              </GridItem>
              <GridItem colSpan="8">
                <Box borderBottomWidth="1px" pb="8" mb="8">
                  <Heading as="h2" size="lg" fontWeight="medium" mb="4">
                    Details
                  </Heading>
                  <Grid templateColumns={{ lg: 'repeat(2, 1fr)' }} gap="6">
                    <GridItem colSpan="1">
                      <Box mb="12">
                        <Heading as="h3" size="md" fontWeight="medium" mb="2">
                          Photos
                        </Heading>
                        {images && images.length > 0 && (
                          <Grid templateColumns="repeat(2, 1fr)" gap="2">
                            {images.map((img, idx) => (
                              <GridItem key={idx}>
                                <AspectRatio ratio={4 / 3}>
                                  <Button
                                    d="block"
                                    w="100%"
                                    h="auto"
                                    p="0"
                                    overflow="hidden"
                                    onClick={() => handleOpenModal(img.url)}
                                  >
                                    <Image
                                      h="100%"
                                      w="100%"
                                      objectFit="cover"
                                      fallback={<ImageFallback />}
                                      rounded="md"
                                      src={img.url}
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
                        <Text>{report.details}</Text>
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
                <Box borderTopWidth="2px" pt="4">
                  <CommentBox />
                </Box>
              </GridItem>
            </Grid>
          </Container>
        )}
      </Box>
      <Modal
        onClose={modalState.onClose}
        isOpen={modalState.isOpen}
        isCentered
        size="full"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent bg="transparent" position="relative">
          {modalType}
        </ModalContent>
      </Modal>
    </>
  )
}

const CommentBox = () => {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { id } = router.query
  const commentsDispatch = useCommentDispatch()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const data = await postComment({
        objectType: commentType.REPORT,
        objectId: Number(id),
        content: comment,
        userId: 0,
      })
      if (data.error) throw new Error(data.error)
      await commentsDispatch(createComment(data))
      setComment('')
      setIsSubmitting(false)
    } catch (error) {
      setIsSubmitting(false)
      alert(error)
    }
  }

  return (
    <>
      <FormControl id="comment" mb="2">
        <FormLabel>Write a Comment</FormLabel>
        <Textarea
          placeholder="Write your comment..."
          bg="white"
          value={comment}
          isReadOnly={isSubmitting}
          onChange={(e) => setComment(e.target.value)}
        />
        {/* <FormHelperText>We'll never share your email.</FormHelperText> */}
      </FormControl>
      <Flex>
        <Button
          ml="auto"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText="Submitting..."
          onClick={handleSubmit}
        >
          Submit Comment
        </Button>
      </Flex>
    </>
  )
}

const ImageFallback = () => (
  <Flex align="center" justify="center">
    <Spinner size="xs" />
  </Flex>
)

const ImageModal = ({ imageSrc, handleModalClose }) => (
  <ModalBody
    position="absolute"
    w="100%"
    h="100%"
    p="8"
    onClick={handleModalClose}
  >
    <ModalCloseButton color="white" />
    <Image h="100%" w="100%" objectFit="contain" src={imageSrc} />
  </ModalBody>
)

const ActivityList = ({ activities }) => {
  const [gray50] = useToken('colors', ['gray.50'])
  return (
    <Box>
      {activities.map((a, idx) => (
        <Box key={idx}>
          {a.type === 'update' ? (
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
                    name={a.name || 'John Doe'}
                    src="https://bit.ly/broken-link"
                  />
                </Box>
                <Box ml="4">
                  <Box by="1">
                    <Text lineHeight="1.2" fontWeight="medium">
                      {a.name || 'John Doe'}
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
          )}
        </Box>
      ))}
    </Box>
  )
}
