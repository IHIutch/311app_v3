import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Input,
} from '@chakra-ui/react'
import Head from 'next/head'
import Navbar from '@/components/global/Navbar'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabase'
import axios from 'redaxios'
import { useAuthUser } from '@/swr/user'

export default function Register() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        axios.post(`/api/auth/register`, {
          event,
          session,
          userData: {
            firstName: form.firstName,
            lastName: form.lastName,
          },
        })
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [form])

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      setIsSubmitting(true)
      await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      router.push('/profile')
    } catch (error) {
      setIsSubmitting(false)
      alert(error.message)
    }
  }

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useAuthUser()

  useEffect(() => {
    if (user) {
      router.replace('/profile')
    }
  }, [router, user])

  return (
    <>
      <Head>
        <title>Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box py="16">
        <Navbar />
        <Grid templateColumns={{ md: 'repeat(12, 1fr)' }} gap="6">
          <GridItem
            colStart={{ md: '3', xl: '4' }}
            colSpan={{ md: '8', xl: '6' }}
          >
            <Box bg="white" borderWidth="1px" rounded="md" p="8">
              <form onSubmit={handleSubmit}>
                <Grid gap="6">
                  <GridItem>
                    <FormControl id="firstName">
                      <FormLabel>First Name</FormLabel>
                      <Input
                        value={form.firstName}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            firstName: e.target.value,
                          })
                        }
                        type="text"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl id="lastName">
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        value={form.lastName}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            lastName: e.target.value,
                          })
                        }
                        type="text"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl id="email">
                      <FormLabel>Email address</FormLabel>
                      <Input
                        value={form.email}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email: e.target.value,
                          })
                        }
                        type="email"
                      />
                      <FormHelperText>
                        We'll never share your email.
                      </FormHelperText>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl id="password">
                      <FormLabel>Password</FormLabel>
                      <Input
                        value={form.password}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            password: e.target.value,
                          })
                        }
                        type="password"
                      />
                      <FormHelperText>Choose a good one.</FormHelperText>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <Button
                      isLoading={isSubmitting}
                      colorScheme="blue"
                      type="submit"
                    >
                      Submit
                    </Button>
                  </GridItem>
                </Grid>
              </form>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </>
  )
}
