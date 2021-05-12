import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { ReportProvider } from '@/context/reports'
import { CommentProvider } from '@/context/comments'
import { UserProvider } from '@/context/users'
import customTheme from '@/customTheme'

const theme = extendTheme(customTheme)

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <UserProvider>
      <ReportProvider>
        <CommentProvider>
          <Component {...pageProps} />
        </CommentProvider>
      </ReportProvider>
    </UserProvider>
  </ChakraProvider>
)

export default MyApp
