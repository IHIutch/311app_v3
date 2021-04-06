import { useRouter } from 'next/router'
import { Box } from '@chakra-ui/react'
import Container from '@/components/common/Container'

export default function SingleReport() {
  const router = useRouter()
  const { reportId } = router.query

  return (
    <Container>
      <Box>{reportId}</Box>
    </Container>
  )
}
