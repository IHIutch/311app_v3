import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  useBoolean,
} from '@chakra-ui/react'
import Head from 'next/head'
import Navbar from '@/components/global/Navbar'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabase'
import axios from 'redaxios'
import { useAuthUser } from '@/utils/swr/user'
import { useForm } from 'react-hook-form'

export default function Register() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isShowing, setIsShowing] = useBoolean()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const [firstName, lastName] = getValues(['firstName', 'lastName'])
        await axios.post(`/api/auth/register`, {
          event,
          session,
          userData: {
            firstName,
            lastName,
          },
        })
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [getValues, router])

  const onSubmit = async (form) => {
    try {
      setIsSubmitting(true)
      await supabase.auth.signUp({
        email: form.email,
        password: form['new-password'],
      })
    } catch (error) {
      setIsSubmitting(false)
      alert(error.message)
    }
  }

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useAuthUser({})

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
      <Container maxW="container.lg" py="24">
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
                    <FormControl id="firstName" isInvalid={errors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        {...register('firstName', {
                          required: 'This field is required',
                        })}
                        type="text"
                        autoComplete="given-name"
                      />
                      <FormErrorMessage>
                        {errors.firstName && errors.firstName.message}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl id="lastName" isInvalid={errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        {...register('lastName', {
                          required: 'This field is required',
                        })}
                        type="text"
                        autoComplete="family-name"
                      />
                      <FormErrorMessage>
                        {errors.lastName && errors.lastName.message}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl id="email" isInvalid={errors.email}>
                      <FormLabel>Email address</FormLabel>
                      <Input
                        {...register('email', {
                          required: 'This field is required',
                        })}
                        type="email"
                        autoComplete="email"
                      />
                      <FormErrorMessage>
                        {errors.email && errors.email.message}
                      </FormErrorMessage>
                      <FormHelperText>
                        For login and notification purposes only. We will never
                        share your email.
                      </FormHelperText>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isInvalid={errors['new-password']}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          {...register('new-password', {
                            required: 'This field is required',
                          })}
                          type={isShowing ? 'text' : 'password'}
                          autoComplete="new-password"
                        />
                        <InputRightElement width="4.5rem">
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={setIsShowing.toggle}
                          >
                            {isShowing ? 'Hide' : 'Show'}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>
                        {errors['new-password'] &&
                          errors['new-password'].message}
                      </FormErrorMessage>
                      <FormHelperText>
                        Please create a password with 8 or more characters.
                      </FormHelperText>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <Button
                      loadingText="Registering..."
                      isLoading={isSubmitting}
                      colorScheme="blue"
                      type="submit"
                    >
                      Register
                    </Button>
                  </GridItem>
                </Grid>
              </form>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </>
  )
}
