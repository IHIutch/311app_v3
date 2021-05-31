import React from 'react'
import { Box } from '@chakra-ui/react'
import { getLoggedUser } from '@/controllers/auth'

export default function Profile({ user }) {
  return <Box>{user && <Box>{user.email}</Box>}</Box>
}

export async function getServerSideProps({ req }) {
  const user = await getLoggedUser(req)

  if (!user) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    }
  }

  return {
    props: {
      user,
    },
  }
}
