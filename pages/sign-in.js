import Navbar from '@/components/global/Navbar'
import { useAuthUser } from '@/utils/swr/user'
import { supabase } from '@/utils/supabase'
import {
  Box,
  Grid,
  GridItem,
  Link,
  FormControl,
  FormLabel,
  Button,
  Input,
  Flex,
  FormErrorMessage,
} from '@chakra-ui/react'
import Head from 'next/head'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'redaxios'

export default function SignIn() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        axios.post(`/api/auth/signin`, {
          event,
          session,
        })
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [])

  const onSubmit = async (form) => {
    try {
      setIsSubmitting(true)
      await supabase.auth.signIn({
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
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid gap="6">
                  <GridItem>
                    <FormControl id="email" isInvalid={errors.email}>
                      <FormLabel>Email address</FormLabel>
                      <Input
                        {...register('email', { required: true })}
                        type="email"
                      />
                      <FormErrorMessage>Email is required</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl id="password" isInvalid={errors.password}>
                      <FormLabel>Password</FormLabel>
                      <Input
                        {...register('password', { required: true })}
                        type="password"
                      />
                      <FormErrorMessage>Password is required</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem d="flex">
                    <Flex align="center">
                      <NextLink href={'/forgot-password'} passHref>
                        <Button
                          as={Link}
                          variant="link"
                          fontWeight="semibold"
                          colorScheme="blue"
                        >
                          Forgot Password?
                        </Button>
                      </NextLink>
                    </Flex>
                    <Button
                      ml="auto"
                      isLoading={isSubmitting}
                      colorScheme="blue"
                      type="submit"
                    >
                      Sign In
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
