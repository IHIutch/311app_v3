import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import Head from 'next/head'
import { ReportProvider } from '../context/reports'
import customTheme from '../customTheme'

const theme = extendTheme(customTheme)

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <ReportProvider>
      <Component {...pageProps} />
    </ReportProvider>
  </ChakraProvider>
)

export default MyApp
