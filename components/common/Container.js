import { Box, useToken } from '@chakra-ui/react'

const Container = ({ children, fluid = false, ...props }) => {
  const [containerWidths] = useToken('sizes', ['container'])
  const maxW =
    fluid === true
      ? 'none'
      : fluid === 'sm'
      ? containerWidths
      : fluid === 'md'
      ? { ...containerWidths, base: '100%', sm: '100%' }
      : fluid === 'lg'
      ? { ...containerWidths, base: '100%', sm: '100%', md: '100%' }
      : fluid === 'xl'
      ? { ...containerWidths, base: '100%', sm: '100%', md: '100%', lg: '100%' }
      : containerWidths

  return (
    <Box width="100%" maxW={maxW} mx="auto" px="4" {...props}>
      {children}
    </Box>
  )
}

export default Container
