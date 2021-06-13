import NextLink from 'next/link'
import {
  Box,
  Flex,
  Link,
  useDisclosure,
  CloseButton,
  Button,
  Icon,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react'
import Container from '@/components/common/Container'

import { UilTimes, UilBars } from '@iconscout/react-unicons'

const Navbar = ({ sx }) => {
  const { isOpen, onToggle } = useDisclosure()

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

  const navItemsRight = [
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
                h="100%"
                d={{ base: isOpen ? 'block' : 'none', md: 'flex' }}
                w={{ base: 'full', md: 'auto' }}
                ml="auto"
                pb={{ base: '4', md: '0' }}
              >
                {navItemsRight.map((link, idx) => (
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
                <CreateReportButton d={{ base: 'none', md: 'inline-flex' }} />
              </Box>
            </Flex>
          </Flex>
        </Container>
      </Box>
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
