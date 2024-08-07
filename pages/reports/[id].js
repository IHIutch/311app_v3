import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import * as Sentry from '@sentry/nextjs'
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
  FormControl,
  FormLabel,
  Textarea,
  Link,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ButtonGroup,
  Input,
  Stack,
  ModalHeader,
  ModalFooter,
  Select,
  Container,
} from '@chakra-ui/react'
import Head from 'next/head'
import Navbar from '@/components/global/Navbar'
import { formatDate, formatDateFromNow, isAdmin } from '@/utils/functions'
import { commentType, reportStatusType } from '@/utils/types'
import { postComment } from '@/utils/axios/comments'
import { apiGetReport } from '@/controllers/reports'

import {
  UilCommentsAlt,
  UilCalender,
  UilExclamationTriangle,
  UilCamera,
  UilMapMarker,
  UilNotes,
  UilAngleDown,
  UilUserCircle,
  UilSchedule,
  UilShieldCheck,
  UilLabelAlt,
  UilSearchAlt,
  UilCheckCircle,
} from '@iconscout/react-unicons'
import { apiGetComments } from '@/controllers/comments'
import dynamic from 'next/dynamic'
import { putReport } from '@/utils/axios/reports'
import StatusIndicator from '@/components/common/StatusIndicator'
import DatePicker from '@/components/common/DatePicker'
import dayjs from 'dayjs'
import { apiGetChangelog } from '@/controllers/changelog'
import { useGetReport } from '@/utils/react-query/reports'
import { useAuthUser } from '@/utils/react-query/user'
import { useCreateComment, useGetComments } from '@/utils/react-query/comments'
import { useGetChangelog } from '@/utils/react-query/changelog'
import BlurUpImage from '@/components/common/BlurUpImage'

const ReportMap = dynamic(() => import('@/components/report/ReportMap'), {
  // loading: () => <p>Loading...</p>,
  ssr: false,
})

export default function SingleReport({ images, ...props }) {
  const modalState = useDisclosure()
  const [modalType, setModalType] = useState(null)

  const {
    data: report,
    isLoading: isReportLoading,
    isError: isReportError,
  } = useGetReport(props.report.id)

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useAuthUser()

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useGetComments({
    objectType: commentType.REPORT,
    objectId: props.report.id,
  })

  const {
    data: changelog,
    isLoading: isChangelogLoading,
    isError: isChangelogError,
  } = useGetChangelog({
    objectType: 'REPORT',
    objectId: props.report.id,
  })

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
          <Container maxW="container.lg">
            <Grid templateColumns={{ lg: 'repeat(12, 1fr)' }} gap="6">
              <GridItem colSpan={{ lg: '8' }}>
                <Box borderBottomWidth="1px" pb="8">
                  <Flex align="center">
                    <Square
                      color="white"
                      rounded="lg"
                      size="16"
                      bg={report.ReportType.markerColor}
                    >
                      <Icon boxSize="8" as={UilExclamationTriangle} />
                    </Square>
                    <Box ml="4">
                      <Text as="span">
                        #{report.id} • {report.ReportType.group}
                      </Text>
                      <Heading as="h1" size="lg" fontWeight="semibold">
                        {report.ReportType.name}
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
                  <StatusIndicator status={report.status} />
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
                        {images?.length ? (
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
                                    <BlurUpImage
                                      alt={img?.title}
                                      src={img?.src}
                                      blurDataURL={img?.blurDataURL}
                                    />
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
                      <Flex align="center" mb="4">
                        <Icon as={UilMapMarker} boxSize="6" />
                        <Heading as="h3" size="md" fontWeight="medium" ml="2">
                          Location
                        </Heading>
                      </Flex>
                      <Box>
                        <Stack direction="row" spacing="8" mb="2">
                          {report?.location?.street_number &&
                            report?.location?.route &&
                            report?.location?.locality &&
                            report?.location?.administrative_area_level_1 &&
                            report?.location?.postal_code && (
                              <Box>
                                <Heading as="h4" size="sm" fontWeight="medium">
                                  Address
                                </Heading>
                                <Box fontSize="sm">
                                  <Text>
                                    {report.location.street_number}{' '}
                                    {report.location.route}
                                  </Text>
                                  <Text>
                                    {report.location.locality}{' '}
                                    {
                                      report.location
                                        .administrative_area_level_1
                                    }
                                    , {report.location.postal_code}
                                  </Text>
                                </Box>
                              </Box>
                            )}
                          {report.lng && report.lat && (
                            <Box>
                              <Heading as="h4" size="sm" fontWeight="medium">
                                Coordinates
                              </Heading>
                              <Text fontSize="sm">
                                {`${report.lat.toFixed(
                                  3
                                )}, ${report.lng.toFixed(3)}`}
                              </Text>
                            </Box>
                          )}
                        </Stack>
                        {report.lng && report.lat ? (
                          <Box>
                            <AspectRatio
                              ratio={16 / 9}
                              rounded="md"
                              overflow="hidden"
                              mb="2"
                            >
                              <ReportMap marker={report} />
                            </AspectRatio>
                          </Box>
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
                  <ActivityList />
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
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: comments } = useGetComments({
    objectType: commentType.REPORT,
    objectId: Number(id),
  })

  const { mutate: handleCreateComment } = useCreateComment({
    objectType: commentType.REPORT,
    objectId: Number(id),
  })

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useAuthUser()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      handleCreateComment({
        objectType: commentType.REPORT,
        objectId: Number(id),
        content: comment,
        creatorId: user.id,
        user: user
          ? {
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
            }
          : null,
      })
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

const ActivityList = () => {
  const router = useRouter()
  const { id } = router.query

  const [gray50] = useToken('colors', ['gray.50'])
  const [space6] = useToken('space', [6])

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useGetComments({
    objectType: commentType.REPORT,
    objectId: Number(id),
  })

  const {
    data: changelog,
    isLoading: isChangelogLoading,
    isError: isChangelogError,
  } = useGetChangelog({
    objectType: 'REPORT',
    objectId: Number(id),
  })

  const activities = useMemo(() => {
    const mappedChangelog = (changelog || [])
      .filter((c) => c.objectAttr === 'status')
      .map((c) => ({
        ...c,
        type: 'changelog',
      }))
    const mappedComments = (comments || []).map((c) => ({
      ...c,
      type: 'comment',
    }))
    return mappedComments
      .concat(mappedChangelog)
      .sort((a, b) => (dayjs(a.createdAt).isAfter(dayjs(b.createdAt)) ? 1 : -1))
  }, [changelog, comments])

  return (
    <Box>
      {activities.map((a, idx) => (
        <Box key={idx} pb="8" borderLeftWidth="2px" ml="6">
          <Box ml={`calc(${space6} * -1 + -1px)`}>
            {a.type === 'changelog' ? (
              <ChangelogActivity activity={a} />
            ) : (
              <Flex>
                <Box flexShrink="0" w="12">
                  <Avatar
                    mx="auto"
                    boxShadow={`0 0 0 6px ${gray50}`}
                    name={
                      a?.creatorId && a?.user?.firstName && a?.user?.lastName
                        ? `${a.user.firstName} ${a.user.lastName}`
                        : 'John Doe'
                    }
                  />
                </Box>
                <Box ml="4" flexGrow="1">
                  <Flex direction="column" mb="2">
                    <Text lineHeight="1.2" fontWeight="medium">
                      {a?.creatorId && a?.user?.firstName && a?.user?.lastName
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

const ChangelogActivity = ({ activity }) => {
  const [gray50] = useToken('colors', ['gray.50'])
  const value =
    activity.newValue === reportStatusType.IN_REVIEW
      ? 'In Review'
      : activity.newValue === reportStatusType.SCHEDULED
      ? 'Scheduled'
      : ''

  return (
    <Flex align="center">
      <Box flexShrink="0" w="12">
        <Circle
          boxShadow={`0 0 0 6px ${gray50}`}
          size="8"
          bg="gray.200"
          color="white"
          mx="auto"
        >
          <Icon
            color="black"
            boxSize="5"
            as={
              activity.newValue === reportStatusType.IN_REVIEW
                ? UilSearchAlt
                : activity.newValue === reportStatusType.SCHEDULED
                ? UilCalender
                : ''
            }
          />
        </Circle>
      </Box>
      <Box ml="4" flexGrow="1">
        <Text as="span">
          <Text as="span" fontWeight="semibold">
            Status
          </Text>{' '}
          changed to{' '}
          <Text as="span" fontWeight="semibold">
            {value}
          </Text>
        </Text>
        <Text
          as="time"
          fontSize="sm"
          dateTime={activity.createdAt}
          title={formatDate(activity.createdAt, 'MMM D, YYYY h:mm A z')}
          color="gray.500"
          ml="2"
        >
          {formatDateFromNow(activity.createdAt)}
        </Text>
      </Box>
    </Flex>
  )
}

const UpdateStatusWrapper = () => {
  const modalState = useDisclosure()
  const [modalType, setModalType] = useState(null)

  const router = useRouter()
  const { id } = router.query

  const { data: report, mutate } = useGetReport(id, {})

  const handleOpenModal = (content) => {
    setModalType(content)
    modalState.onOpen()
  }

  const handleUpdateReport = async (payload) => {
    const data = await putReport(id, payload)
    if (data.error) throw new Error(data.error)
    return await mutate({ ...report, data })
  }

  return (
    <>
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
                Updating the status of a report will cause subscribed users to
                be notified of the change.
              </Text>
            </Box>
            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                rightIcon={<Icon as={UilAngleDown} boxSize="6" />}
                isFullWidth
                variant="solid"
                colorScheme="blue"
              >
                Update Status
              </MenuButton>
              <MenuList>
                <MenuItem
                  fontWeight="medium"
                  icon={<Icon as={UilSearchAlt} boxSize="5" />}
                  onClick={() =>
                    handleOpenModal(
                      <InReviewModal
                        handleModalClose={modalState.onClose}
                        handleUpdateReport={handleUpdateReport}
                      />
                    )
                  }
                >
                  Mark as In Review
                </MenuItem>
                <MenuItem
                  fontWeight="medium"
                  icon={<Icon as={UilUserCircle} boxSize="5" />}
                  onClick={() =>
                    handleOpenModal(
                      <AssignModal
                        handleModalClose={modalState.onClose}
                        handleUpdateReport={handleUpdateReport}
                      />
                    )
                  }
                >
                  Assign Report
                </MenuItem>
                <MenuItem
                  fontWeight="medium"
                  icon={<Icon as={UilSchedule} boxSize="5" />}
                  onClick={() =>
                    handleOpenModal(
                      <ScheduleModal
                        handleModalClose={modalState.onClose}
                        handleUpdateReport={handleUpdateReport}
                      />
                    )
                  }
                >
                  Schedule Report
                </MenuItem>
                <MenuItem
                  color="red.600"
                  fontWeight="medium"
                  icon={<Icon as={UilCheckCircle} boxSize="5" />}
                  onClick={() =>
                    handleOpenModal(
                      <CloseModal
                        handleModalClose={modalState.onClose}
                        handleUpdateReport={handleUpdateReport}
                      />
                    )
                  }
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
      <Modal onClose={modalState.onClose} isOpen={modalState.isOpen}>
        <ModalOverlay />
        <ModalContent>{modalType}</ModalContent>
      </Modal>
    </>
  )
}

const InReviewModal = ({ handleModalClose, handleUpdateReport }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateReport = async (payload) => {
    try {
      setIsUpdating(true)
      await handleUpdateReport(payload)
      handleModalClose()
      setIsUpdating(false)
    } catch (error) {
      setIsUpdating(false)
      alert(error)
    }
  }

  return (
    <>
      <ModalHeader>Mark as In Review</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>
          Are you sure you want to update this report&apos;s status to{' '}
          <Text fontWeight="bold" as="span">
            In Review
          </Text>
          ? All subscribed user&apos;s will be notified.
        </Text>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button
            variant="ghost"
            onClick={handleModalClose}
            isDisabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            isLoading={isUpdating}
            loadingText="Updating"
            onClick={() =>
              updateReport({
                status: reportStatusType.IN_REVIEW,
              })
            }
          >
            Confirm Update
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  )
}

const AssignModal = ({ handleModalClose, handleUpdateReport }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateReport = async (payload) => {
    try {
      setIsUpdating(true)
      await handleUpdateReport(payload)
      handleModalClose()
      setIsUpdating(false)
    } catch (error) {
      setIsUpdating(false)
      alert(error)
    }
  }

  return (
    <>
      <ModalHeader>Assign Report</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text mb="4">
          Are you sure you want assign this report? All subscribed users will be
          notified.
        </Text>
        <FormControl id="assignTo">
          <FormLabel>Assign Report to</FormLabel>
          <Select placeholder="---">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button
            variant="ghost"
            onClick={handleModalClose}
            isDisabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            isLoading={isUpdating}
            loadingText="Updating"
            // TODO: Add options to assign report
            onClick={() =>
              updateReport({
                status: reportStatusType.ASSIGNED,
              })
            }
          >
            Assign
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  )
}

const ScheduleModal = ({ handleModalClose, handleUpdateReport }) => {
  const router = useRouter()
  const { id } = router.query
  const { data: report } = useGetReport(id, {})

  const [isUpdating, setIsUpdating] = useState(false)
  const [scheduledDate, setScheduledDate] = useState(
    dayjs(report.scheduledDate).isValid()
      ? dayjs(report.scheduledDate).toDate()
      : ''
  )

  const updateReport = async (payload) => {
    try {
      setIsUpdating(true)
      await handleUpdateReport(payload)
      handleModalClose()
      setIsUpdating(false)
    } catch (error) {
      setIsUpdating(false)
      alert(error)
    }
  }

  return (
    <>
      <ModalHeader>Schedule Report</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text mb="4">
          Are you sure you want schedule this report? All subscribed users will
          be notified.
        </Text>
        <FormControl id="scheduleDate">
          <FormLabel>Schedule For</FormLabel>
          <DatePicker
            selectedDate={scheduledDate}
            onChange={setScheduledDate}
            showPopperArrow={true}
          />
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button
            variant="ghost"
            onClick={handleModalClose}
            isDisabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            isLoading={isUpdating}
            loadingText="Updating"
            onClick={() =>
              updateReport({
                scheduledDate,
                status: reportStatusType.SCHEDULED,
              })
            }
          >
            Schedule
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  )
}

const CloseModal = ({ handleModalClose, handleUpdateReport }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateReport = async (payload) => {
    try {
      setIsUpdating(true)
      await handleUpdateReport(payload)
      handleModalClose()
      setIsUpdating(false)
    } catch (error) {
      setIsUpdating(false)
      alert(error)
    }
  }

  return (
    <>
      <ModalHeader>Mark as Closed</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>
          Are you sure you want to update this report&apos;s status to {''}
          <Text fontWeight="bold" as="span">
            Closed
          </Text>
          ? All subscribed user&apos;s will be notified.
        </Text>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button
            variant="ghost"
            onClick={handleModalClose}
            isDisabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            isLoading={isUpdating}
            loadingText="Updating"
            onClick={() =>
              updateReport({
                status: reportStatusType.CLOSED,
              })
            }
          >
            Close Report
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  )
}

export async function getServerSideProps({ req, params: { id } }) {
  // try {
  const report = await apiGetReport(id)
  const images = await Promise.all(
    report.images?.length
      ? report.images.map(async (img) => {
          return {
            ...img,
            url: img?.src || null,
          }
        })
      : []
  )

  const comments = await apiGetComments({
    objectType: commentType.REPORT,
    objectId: id,
  })

  const changelog = await apiGetChangelog({
    objectType: 'REPORT',
    objectId: id,
  })
  return {
    props: {
      report,
      images: images || null,
      comments,
      changelog,
    },
  }
  // } catch (error) {
  //   Sentry.captureException(error)
  //   return {
  //     notFound: true,
  //   }
  // }
}
