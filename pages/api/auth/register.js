import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const { email, password } = req.body
        const { user, session, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          res.status(error.status).json(error)
        } else {
          res.status(resStatusType.SUCCESS).json({ user, session })
        }
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
