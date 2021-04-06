import { Box } from '@chakra-ui/react'

const Container = ({ sx, children }) => {
  const containerWidths = [
    '100%',
    '640px',
    '768px',
    '1024px',
    '1280px',
    // "1536px",
  ]

  return (
    <Box sx={sx} maxWidth={[...containerWidths]} mx="auto">
      {children}
    </Box>
  )
}

export default Container
