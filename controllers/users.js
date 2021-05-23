import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'

export const apiPostRegisterUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const { user, session, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) return res.status(error.status).json({ error })
    return res.status(resStatusType.SUCCESS).json({ user, session })
  } catch (error) {
    return res.status(resStatusType.BAD_REQUEST).json({ error })
  }
}

export const apiGetUser = async (req, res) => {
  try {
    const { id } = req.query
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .match({ id })
      .single()

    if (error) {
      throw new Error(error)
    }
    res.status(resStatusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
}

export const apiPostSignInUser = async (req, res) => {
  supabase.auth.api.setAuthCookie(req, res)
}

export const apiPostForgotPassword = () => {}

export const apiPostUpdatePassword = () => {}
