import supabase from '@/utils/supabase'
import { userType } from '@/utils/types'

export const apiPostRegisterUser = async (
  req,
  res,
  { session: { user }, userData }
) => {
  const { error } = await supabase.from('Users').insert([
    {
      id: user.id,
      type: userType.USER,
      ...userData,
    },
  ])
  if (error) throw new Error(error.message)

  return supabase.auth.api.setAuthCookie(req, res)
}

export const apiGetUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .match({ id: user.id })
    .single()

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiPostUser = async (payload) => {
  const { data, error } = await supabase.from('Users').insert(payload)

  if (error) {
    throw new Error(error)
  }
  return data
}

export const apiPutUser = async (id, payload) => {
  const { data, error } = await supabase
    .from('Users')
    .update(payload)
    .match({ id })

  if (error) {
    throw new Error(error)
  }
  return data
}

export const apiPostSignInUser = async (req, res) => {
  return supabase.auth.api.setAuthCookie(req, res)
}

export const apiPostSignOutUser = async (req, res) => {
  return await supabase.auth.api.signOut(req, res)
}

export const apiPostForgotPassword = () => {}

export const apiPostUpdatePassword = () => {}
