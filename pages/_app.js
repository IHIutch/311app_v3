import { ChakraProvider } from '@chakra-ui/react'
import { ReportProvider } from '../context/reports'

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider>
    <ReportProvider>
      <Component {...pageProps} />
    </ReportProvider>
  </ChakraProvider>
)

export default MyApp
