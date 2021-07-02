import NextLink from 'next/link'
import {
  Box,
  Flex,
  Link,
  useDisclosure,
  Button,
  Icon,
  useBreakpointValue,
  IconButton,
  Avatar,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ButtonGroup,
  FormControl,
  FormLabel,
  Textarea,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react'
import Container from '@/components/common/Container'

import { UilTimes, UilBars, UilAngleDown } from '@iconscout/react-unicons'
import { useAuthUser } from '@/swr/user'

const Navbar = ({ sx }) => {
  const { isOpen, onToggle } = useDisclosure()
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useAuthUser()

  const navItemsLeft = [
    {
      name: 'Reports',
      path: '/',
    },
    {
      name: 'Alerts',
      path: '/alerts',
    },
  ]

  const navItemsRight = !user && [
    {
      name: 'Sign In',
      path: '/sign-in',
    },
    {
      name: 'Register',
      path: '/register',
    },
  ]

  return (
    <Box>
      <Box
        h="16"
        as="nav"
        bg="white"
        shadow="sm"
        position="fixed"
        zIndex="2"
        top="0"
        left="0"
        right="0"
        sx={sx}
      >
        <Container fluid="md">
          <Flex flexGrow="1" wrap="wrap" align="center">
            <Box mr="12">
              <NextLink href="/" passHref>
                <Link
                  d="flex"
                  alignItems="center"
                  px="4"
                  mx="-4"
                  h="16"
                  _hover=""
                  fontSize="lg"
                  fontWeight="bold"
                >
                  Buffalo 311
                </Link>
              </NextLink>
            </Box>
            <Flex align="center" ml="auto">
              <CreateReportButton d={{ md: 'none' }} />
              <IconButton
                ml="4"
                d={{ base: 'block', md: 'none' }}
                onClick={onToggle}
                variant="ghost"
                size="sm"
                icon={<Icon as={isOpen ? UilTimes : UilBars} boxSize="6" />}
              />
            </Flex>
            <Flex
              flexGrow="1"
              w={{ base: '100%', md: 'auto' }}
              flexDirection={{ base: 'column', md: 'row' }}
            >
              <Box
                alignItems="stretch"
                h="100%"
                d={{ base: isOpen ? 'block' : 'none', md: 'flex' }}
                w={{ base: 'full', md: 'auto' }}
              >
                {navItemsLeft.map((link, idx) => (
                  <NextLink key={idx} href={link.path} passHref>
                    <Link
                      h={{ base: '12', md: '16' }}
                      d={{ base: 'flex', md: 'inline-flex' }}
                      _hover={{ color: { md: 'black' } }}
                      rounded={{ base: 'md', md: 'none' }}
                      fontWeight="medium"
                      alignItems="center"
                      px={{ md: '4' }}
                    >
                      {link.name}
                    </Link>
                  </NextLink>
                ))}
              </Box>
              <Box
                alignItems="stretch"
                h={{ base: '12', md: '16' }}
                d={{ base: isOpen ? 'block' : 'none', md: 'flex' }}
                w={{ base: 'full', md: 'auto' }}
                ml="auto"
                pb={{ base: '4', md: '0' }}
              >
                {navItemsRight &&
                  navItemsRight.map((link, idx) => (
                    <NextLink key={idx} href={link.path} passHref>
                      <Link
                        h={{ base: '12', md: '16' }}
                        d={{ base: 'flex', md: 'inline-flex' }}
                        _hover={{ color: { md: 'black' } }}
                        rounded={{ base: 'md', md: 'none' }}
                        fontWeight="medium"
                        alignItems="center"
                        px={{ md: '4' }}
                      >
                        {link.name}
                      </Link>
                    </NextLink>
                  ))}
                <Button
                  pl="4"
                  pr="4"
                  variant="link"
                  h={{ base: '12', md: '16' }}
                  color="inherit"
                  _hover={{
                    color: 'black',
                    textDecoration: 'none',
                  }}
                  rounded="none"
                  fontWeight="medium"
                  onClick={onModalOpen}
                >
                  Feedback?
                </Button>
                <CreateReportButton d={{ base: 'none', md: 'inline-flex' }} />
                {user && (
                  <Flex d="inline-flex" ml="2" align="center">
                    <Menu placement="bottom-end">
                      <MenuButton
                        as={Button}
                        rightIcon={<Icon boxSize="5" as={UilAngleDown} />}
                        variant="link"
                        p="2"
                        h={{ base: '12', md: '16' }}
                        rounded="none"
                        color="black"
                        _hover={{
                          textDecoration: 'none',
                        }}
                      >
                        <Flex align="center">
                          <Avatar
                            size="sm"
                            name={`${user.firstName} ${user.lastName}`}
                          />
                          <Text as="span" ml="2" fontWeight="medium">
                            {user.firstName} {user.lastName?.charAt(0)}
                          </Text>
                        </Flex>
                      </MenuButton>
                      <MenuList>
                        <NextLink href="/profile" passHref>
                          <MenuItem as={Link}>Profile</MenuItem>
                        </NextLink>
                        <NextLink href="/sign-out" passHref>
                          <MenuItem as={Link}>Sign Out</MenuItem>
                        </NextLink>
                      </MenuList>
                    </Menu>
                  </Flex>
                )}
              </Box>
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing="4">
              <FormControl id="feedback" isRequired>
                <FormLabel>Feedback</FormLabel>
                <Textarea placeholder="Here is a sample placeholder" />
              </FormControl>
              <FormControl as="fieldset">
                <FormLabel as="legend">Rating</FormLabel>
                <RadioGroup>
                  <Stack spacing="4" direction="row">
                    <Radio value="1">1</Radio>
                    <Radio value="2">2</Radio>
                    <Radio value="3">3</Radio>
                    <Radio value="4">4</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="ghost" onClick={onModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue">Send</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

const CreateReportButton = (props) => {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' })
  return (
    <Flex align="center" {...props}>
      <NextLink href="/create" passHref>
        <Button as={Link} colorScheme="blue" size={buttonSize} isFullWidth>
          Create Report
        </Button>
      </NextLink>
    </Flex>
  )
}

export default Navbar
