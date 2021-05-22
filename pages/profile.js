import React from 'react'
import { Box } from '@chakra-ui/react'
import { supabase } from '@/utils/supabase'

export default function Profile({ user }) {
  return <Box>{user && <Box>{user.email}</Box>}</Box>
}

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req)

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
