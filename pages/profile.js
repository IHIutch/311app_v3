import React, { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { useAuthUser } from '@/swr/user'
import { useRouter } from 'next/router'

export default function Profile() {
  const router = useRouter()
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useAuthUser()

  useEffect(() => {
    if (!user) {
      router.replace('/sign-in')
    }
  }, [router, user])

  return user ? <Box>{user.email}</Box> : <Box>Not signed in</Box>
}
