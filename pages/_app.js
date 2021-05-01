import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { ReportProvider } from '@/context/reports'
import { CommentProvider } from '@/context/comments'
import customTheme from '@/customTheme'

const theme = extendTheme(customTheme)

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <ReportProvider>
      <CommentProvider>
        <Component {...pageProps} />
      </CommentProvider>
    </ReportProvider>
  </ChakraProvider>
)

export default MyApp
