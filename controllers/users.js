import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'

export const apiPostRegisterUser = async (req, res) => {
  try {
    const { email, password } = req.body
    const { user, session, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      // TODO: Make error handling better
      res.status(error.status).json(error)
    } else {
      res.status(resStatusType.SUCCESS).json({ user, session })
    }
  } catch (error) {
    console.error(error)
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
}

export const apiPostForgotPassword = () => {}

export const apiPostUpdatePassword = () => {}
