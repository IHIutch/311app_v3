import { supabase } from '../utils/supabase'
import { resStatusType } from '../utils/types'

export default async function handler(req, res) {
  const { method } = req
  const { user } = req.body

  switch (method) {
    case 'PUT':
      try {
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
      res.setHeader('Allow', ['PUT', 'POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
