import React, { useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import axios from 'redaxios'
import { useRouter } from 'next/router'

export default function SignOut() {
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await axios.post(`/api/auth/signout`, {
          event,
          session,
        })
        router.push('/')
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }
  handleSignOut()

  return <></>
}
