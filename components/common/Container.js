import { Flex } from '@chakra-ui/react'

const Container = ({ children, fluid = false, ...props }) => {
  const containerWidths = [
    '100%',
    '640px',
    '768px',
    '1024px',
    '1280px',
    // "1536px",
  ]

  return (
    <Flex maxWidth={fluid || [...containerWidths]} mx="auto" px="4" {...props}>
      {children}
    </Flex>
  )
}

export default Container
