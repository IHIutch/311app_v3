import NextLink from 'next/link'
import {
  Box,
  Flex,
  Link,
  useDisclosure,
  CloseButton,
  Button,
} from '@chakra-ui/react'
import Container from '@/components/common/Container'

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
    <Box mt="16">
      <Box
        as="nav"
        bg="white"
        shadow="sm"
        position="fixed"
        zIndex="1"
        top="0"
        left="0"
        right="0"
        sx={sx}
      >
        <Container>
          <Flex wrap="wrap" align="center">
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
            <CloseButton
              ml="auto"
              d={{ base: 'block', md: 'none' }}
              onClick={onToggle}
            >
              {/* <Icon as={isOpen ? X : Menu} h="6" w="6" /> */}
            </CloseButton>
            <Box
              alignItems="stretch"
              h="100%"
              d={{ base: isOpen ? 'block' : 'none', md: 'flex' }}
              w={{ base: 'full', md: 'auto' }}
            >
              {navItemsLeft.map((link, idx) => (
                <NextLink key={idx} href={link.path} passHref>
                  <Link
                    h="16"
                    d={{ base: 'flex', md: 'inline-flex' }}
                    _hover={{ color: { md: 'black' } }}
                    rounded={{ base: 'md', md: 'none' }}
                    fontWeight="medium"
                    alignItems="center"
                    px="4"
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
            >
              {navItemsRight.map((link, idx) => (
                <NextLink key={idx} href={link.path} passHref>
                  <Link
                    h="16"
                    d={{ base: 'flex', md: 'inline-flex' }}
                    _hover={{ color: { md: 'black' } }}
                    rounded={{ base: 'md', md: 'none' }}
                    fontWeight="medium"
                    alignItems="center"
                    px="4"
                  >
                    {link.name}
                  </Link>
                </NextLink>
              ))}
              <Flex align="center">
                <NextLink href="/create" passHref>
                  <Button as={Link}>Create Report</Button>
                </NextLink>
              </Flex>
            </Box>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}

export default Navbar
