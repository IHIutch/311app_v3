import { apiGetUser } from '@/controllers/users'
import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'GET':
      return apiGetUser(req, res)

    case 'PUT':
      try {
        const { user } = req.body
        const { data, error } = await supabase.from('users').insert(user)
        if (error) {
          throw new Error(error)
        }
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    case 'POST':
      try {
        const { user } = req.body
        const { data, error } = await supabase.from('users').insert(user)
        if (error) {
          throw new Error(error)
        }
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
