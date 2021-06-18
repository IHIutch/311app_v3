import { useRouter } from 'next/router'
import NextLink from 'next/link'
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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Spinner,
  FormControl,
  FormLabel,
  Textarea,
  Link,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  ButtonGroup,
  Input,
} from '@chakra-ui/react'
import Container from '@/components/common/Container'
import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import {
  setComments,
  createComment,
  useCommentDispatch,
} from '@/context/comments'
import Navbar from '@/components/global/Navbar'
import {
  formatDate,
  formatDateFromNow,
  getPublicURL,
  isAdmin,
} from '@/utils/functions'
import { commentType, reportStatusType } from '@/utils/types'
import { postComment } from '@/utils/axios/comments'
import { setUser, useUserDispatch, useUserState } from '@/context/users'
import { apiGetReport } from '@/controllers/reports'
import { getLoggedUser } from '@/controllers/auth'
import { Blurhash } from 'react-blurhash'
// import NextImage from 'next/image'

import {
  UilLockOpenAlt,
  UilCommentsAlt,
  UilCalender,
  UilExclamationTriangle,
  UilCamera,
  UilMapMarker,
  UilNotes,
  UilAngleDown,
  UilUserCircle,
  UilSchedule,
  UilTimesCircle,
  UilShieldCheck,
  UilLabelAlt,
} from '@iconscout/react-unicons'
import { apiGetComments } from '@/controllers/comments'

export default function SingleReport({ user, report, comments }) {
  const commentsDispatch = useCommentDispatch()
  const userDispatch = useUserDispatch()
  const [activities, setActivities] = useState([])
  const modalState = useDisclosure()

  const [modalType, setModalType] = useState(null)
  const [images, setImages] = useState([])

  const handleSetComments = useCallback(async () => {
    try {
      commentsDispatch(setComments(comments))
    } catch (error) {
      alert(error)
    }
  }, [comments, commentsDispatch])

  const handleSetUser = useCallback(async () => {
    try {
      userDispatch(setUser(user))
    } catch (error) {
      alert(error)
    }
  }, [user, userDispatch])

  useEffect(() => {
    handleSetComments()
    handleSetUser()
  }, [handleSetComments, handleSetUser])

  useEffect(() => {
    if (report.images?.length) {
      const handleGetFileUrls = async () => {
        let imageUrls = []
        for (let img of report.images) {
          imageUrls.push({
            ...img,
            url: await getPublicURL(img.src),
          })
        }
        setImages(imageUrls)
      }
      handleGetFileUrls()
    }
  }, [report.images])

  useEffect(() => {
    const commentsList = comments
      ? Object.values(comments).map((c) => ({ ...c, type: 'comment' }))
      : []
    const mergeActivities = [
      {
        type: 'update',
        attribute: 'STATUS',
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
              <GridItem colSpan={{ lg: '8' }}>
                <Box borderBottomWidth="1px" pb="8">
                  <Flex align="center">
                    <Square color="white" rounded="lg" size="16" bg="blue.500">
                      <Icon boxSize="8" as={UilExclamationTriangle} />
                    </Square>
                    <Box ml="4">
                      <Text as="span">
                        #{report.id} • {report.reportType.group}
                      </Text>
                      <Heading as="h1" size="lg" fontWeight="semibold">
                        {report.reportType.name}
                      </Heading>
                    </Box>
                  </Flex>
                </Box>
              </GridItem>
              <GridItem
                rowSpan={{ lg: '3' }}
                colSpan={{ lg: '4' }}
                borderLeftWidth={{ lg: '1px' }}
                pl={{ lg: '6' }}
              >
                {isAdmin(user) && <UpdateStatusWrapper />}
                <Heading as="h2" size="lg" fontWeight="semibold" mb="8">
                  Status
                </Heading>
                <Box mb="6">
                  {report.status === reportStatusType.CREATED && (
                    <Flex align="center" fontWeight="medium" color="green">
                      <Icon boxSize="6" as={UilLockOpenAlt} />
                      <Text ml="2">Open</Text>
                    </Flex>
                  )}
                </Box>
                <Flex fontWeight="medium" mb="6">
                  <Icon boxSize="6" as={UilCommentsAlt} />
                  <Text ml="2">
                    {comments && Object.keys(comments).length} Comments
                  </Text>
                </Flex>
                <Flex fontWeight="medium" mb="6">
                  <Icon boxSize="6" as={UilCalender} />
                  <Text ml="2">
                    Opened on{' '}
                    <Text
                      as="time"
                      dateTime={report.createdAt}
                      title={formatDate(
                        report.createdAt,
                        'MMM D, YYYY h:mm A z'
                      )}
                    >
                      {formatDate(report.createdAt, 'MMM D, YYYY')}
                    </Text>
                  </Text>
                </Flex>
              </GridItem>
              <GridItem colSpan={{ lg: '8' }}>
                <Box borderBottomWidth="1px" pb="8" mt="4">
                  <Heading as="h2" size="lg" fontWeight="semibold" mb="8">
                    Details
                  </Heading>
                  <Grid templateColumns={{ lg: 'repeat(2, 1fr)' }} gap="6">
                    <GridItem colSpan="1">
                      <Box mb="12">
                        <Flex align="center" mb="2">
                          <Icon as={UilCamera} boxSize="6" />
                          <Heading as="h3" size="md" fontWeight="medium" ml="2">
                            Photos
                          </Heading>
                        </Flex>
                        {report.images?.length > 0 ? (
                          <Grid templateColumns="repeat(2, 1fr)" gap="2">
                            {report.images.map((img, idx) => (
                              <GridItem key={idx}>
                                <AspectRatio ratio={4 / 3}>
                                  <Button
                                    d="block"
                                    w="100%"
                                    h="auto"
                                    p="0"
                                    overflow="hidden"
                                    onClick={() =>
                                      handleOpenModal(images?.[idx]?.url)
                                    }
                                  >
                                    <Image
                                      h="100%"
                                      w="100%"
                                      objectFit="cover"
                                      fallback={
                                        img.blurDataURL ? (
                                          <Blurhash
                                            hash={img.blurDataURL}
                                            width={400}
                                            height={300}
                                            resolutionX={32}
                                            resolutionY={32}
                                            punch={1}
                                          />
                                        ) : (
                                          <ImageFallback />
                                        )
                                      }
                                      rounded="md"
                                      src={images?.[idx]?.url}
                                    />
                                    {/* <NextImage
                                      src={img.url}
                                      blurDataURL={`data:image/jpeg;base64,${img.blurDataURL}`}
                                      placeholder="blur"
                                      layout="fill"
                                    /> */}
                                  </Button>
                                </AspectRatio>
                              </GridItem>
                            ))}
                          </Grid>
                        ) : (
                          <Text color="gray.600" fontStyle="italic">
                            No photos provided
                          </Text>
                        )}
                      </Box>
                      <Box>
                        <Flex align="center" mb="2">
                          <Icon as={UilNotes} boxSize="6" />
                          <Heading as="h3" size="md" fontWeight="medium" ml="2">
                            Description
                          </Heading>
                        </Flex>
                        {report.details ? (
                          <Text fontSize="lg" color="gray.600">
                            {report.details}
                          </Text>
                        ) : (
                          <Text color="gray.600" fontStyle="italic">
                            No description provided
                          </Text>
                        )}
                      </Box>
                    </GridItem>
                    <GridItem colSpan="1">
                      <Flex align="center" mb="2">
                        <Icon as={UilMapMarker} boxSize="6" />
                        <Heading as="h3" size="md" fontWeight="medium" ml="2">
                          Location
                        </Heading>
                      </Flex>
                      <Box>
                        {report.location ? (
                          <Box>{`${report.location.lat}, ${report.location.lng}`}</Box>
                        ) : (
                          <Text color="gray.600" fontStyle="italic">
                            No location provided
                          </Text>
                        )}
                      </Box>
                    </GridItem>
                  </Grid>
                </Box>
              </GridItem>
              <GridItem colSpan={{ lg: '8' }}>
                <Box mb="16" mt="4">
                  <Heading as="h2" size="lg" fontWeight="semibold" mb="8">
                    Activity
                  </Heading>
                  <ActivityList activities={activities} />
                  <Box borderTopWidth="2px" pt="4">
                    <CommentBox />
                  </Box>
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
  const router = useRouter()
  const { id } = router.query
  const { data: user } = useUserState()
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentsDispatch = useCommentDispatch()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const data = await postComment({
        objectType: commentType.REPORT,
        objectId: Number(id),
        content: comment,
        userId: user.id,
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
      {user ? (
        <Flex>
          <Box flexShrink="0" w="12">
            <Avatar
              mx="auto"
              // boxShadow={`0 0 0 6px ${gray50}`}
              name={`${user.firstName} ${user.lastName}`}
            />
          </Box>
          <Box flexGrow="1" ml="4">
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
          </Box>
        </Flex>
      ) : (
        <Flex
          borderWidth="1px"
          borderColor="gray.200"
          bg="gray.100"
          rounded="md"
          p="4"
          align="center"
        >
          <NextLink href={'/register'} passHref>
            <Button as={Link} colorScheme="blue">
              Sign Up
            </Button>
          </NextLink>
          <Text ml="2">
            or{' '}
            <NextLink href={'/sign-in'} passHref>
              <Button as={Link} colorScheme="blue" variant="link">
                Sign In to comment
              </Button>
            </NextLink>
            . Join the conversation.
          </Text>
        </Flex>
      )}
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
  const [space6] = useToken('space', [6])
  return (
    <Box>
      {activities.map((a, idx) => (
        <Box key={idx} pb="8" borderLeftWidth="2px" ml="6">
          <Box ml={`calc(${space6} * -1 + -1px)`}>
            {a.type === 'update' ? (
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
                <Box ml="4" flexGrow="1">
                  <Text as="span">
                    <Text as="span" fontWeight="semibold">
                      Status
                    </Text>{' '}
                    changed to{' '}
                    <Text as="span" fontWeight="semibold">
                      {a.newValue}
                    </Text>
                  </Text>
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
            ) : (
              <Flex>
                <Box flexShrink="0" w="12">
                  <Avatar
                    mx="auto"
                    boxShadow={`0 0 0 6px ${gray50}`}
                    name={
                      a.userId
                        ? `${a.user.firstName} ${a.user.lastName}`
                        : 'John Doe'
                    }
                  />
                </Box>
                <Box ml="4" flexGrow="1">
                  <Flex direction="column" mb="2">
                    <Text lineHeight="1.2" fontWeight="medium">
                      {a.userId
                        ? `${a.user.firstName} ${a.user.lastName}`
                        : 'John Doe'}
                    </Text>
                    <Text
                      as="time"
                      lineHeight="1.4"
                      fontSize="sm"
                      dateTime={a.createdAt}
                      title={formatDate(a.createdAt, 'MMM D, YYYY h:mm A z')}
                      color="gray.500"
                    >
                      {formatDateFromNow(a.createdAt)}
                    </Text>
                  </Flex>
                  <Text color="gray.700">{a.content}</Text>
                </Box>
              </Flex>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const UpdateStatusWrapper = () => {
  return (
    <Box borderBottomWidth="1px" pb="4" mb="4">
      <Box borderWidth="1px" rounded="md" bg="white" overflow="hidden">
        <Flex bg="blue.100" color="blue.700" p="2">
          <Icon as={UilShieldCheck} boxSize="6" />
          <Text fontWeight="medium" fontSize="sm" ml="2">
            You can see this box because you are an Administrator.
          </Text>
        </Flex>
        <Box p="4" borderBottomWidth="1px">
          <Box mb="4">
            <Text fontSize="sm">
              <Text as="span" fontWeight="semibold">
                Caution:{' '}
              </Text>
              Updating the status of a report will cause subscribed users to be
              notified of the change.
            </Text>
          </Box>
          <Menu placement="bottom-end">
            <ButtonGroup w="100%" isAttached colorScheme="blue">
              <Button colorScheme="blue" isFullWidth>
                Mark as Under Review
              </Button>
              <MenuButton
                as={IconButton}
                aria-label="Add to friends"
                icon={<Icon as={UilAngleDown} boxSize="6" />}
              />
            </ButtonGroup>
            <MenuList>
              {/* <MenuItem
                fontWeight="medium"
                icon={<Icon as={UilSearchAlt} boxSize="5" />}
              >
                Mark as In Review
              </MenuItem> */}
              <MenuItem
                fontWeight="medium"
                icon={<Icon as={UilUserCircle} boxSize="5" />}
              >
                Assign Report
              </MenuItem>
              <MenuItem
                fontWeight="medium"
                icon={<Icon as={UilSchedule} boxSize="5" />}
              >
                Schedule Report
              </MenuItem>
              <MenuItem
                color="red.600"
                fontWeight="medium"
                icon={<Icon as={UilTimesCircle} boxSize="5" />}
              >
                Mark as Closed
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Box p="4">
          <FormControl id="labels">
            <Flex align="center" mb="1">
              <Icon boxSize="5" as={UilLabelAlt} />
              <FormLabel fontSize="sm" mb="0" ml="1">
                Labels
              </FormLabel>
            </Flex>
            <Input size="sm" rounded="md" type="text" />
          </FormControl>
        </Box>
      </Box>
    </Box>
  )
}

export async function getServerSideProps({ req, params: { id } }) {
  try {
    const report = await apiGetReport(id)
    const comments = await apiGetComments({
      objectType: commentType.REPORT,
      objectId: id,
    })
    const user = await getLoggedUser(req)
    return {
      props: {
        user,
        report,
        comments,
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}
