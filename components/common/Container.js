import { Box } from '@chakra-ui/react'

const Container = ({ children, fluid = false, ...props }) => {
  const containerWidths =
    fluid === true
      ? null
      : fluid === 'sm'
      ? { base: '100%', sm: '640px', md: '768px', lg: '1024px', xl: '1280px' }
      : fluid === 'md'
      ? { base: '100%', sm: '100%', md: '768px', lg: '1024px', xl: '1280px' }
      : fluid === 'lg'
      ? { base: '100%', sm: '100%', md: '100%', lg: '1024px', xl: '1280px' }
      : fluid === 'xl'
      ? { base: '100%', sm: '100%', md: '100%', lg: '100%', xl: '1280px' }
      : { base: '100%', sm: '640px', md: '768px', lg: '1024px', xl: '1280px' }

  return (
    <Box width="100%" maxW={containerWidths} mx="auto" px="4" {...props}>
      {children}
    </Box>
  )
}

export default Container
