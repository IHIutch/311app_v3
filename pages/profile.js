import React from 'react'
import { Box } from '@chakra-ui/react'
import { supabase } from '@/utils/supabase'
import { getUser } from '@/utils/axios/users'

export default function Profile({ user }) {
  return <Box>{user && <Box>{user.email}</Box>}</Box>
}

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req)
  const data = await getUser(user.id)

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
      user: {
        ...data,
        ...user,
      },
    },
  }
}
