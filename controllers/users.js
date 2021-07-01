import { supabase } from '@/utils/supabase'
import { userType } from '@/utils/types'

export const apiPostRegisterUser = async (
  req,
  res,
  { session: { user }, userData }
) => {
  const { error } = await supabase.from('users').insert([
    {
      id: user.id,
      type: userType.USER,
      ...userData,
    },
  ])
  if (error) throw new Error(error.message)

  return supabase.auth.api.setAuthCookie(req, res)
}

export const apiGetUser = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .match({ id })
    .single()

  if (error) {
    throw new Error(error.message)
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
