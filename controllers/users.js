import { supabase } from '@/utils/supabase'

export const apiPostRegisterUser = async ({ email, password }) => {
  const { user, session, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw new Error(error.message)
  return { user, session }
}

export const apiGetUser = async (params) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .match(params)
    .single()

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiPostSignInUser = async (req, res) => {
  supabase.auth.api.setAuthCookie(req, res)
}

export const apiPostForgotPassword = () => {}

export const apiPostUpdatePassword = () => {}
