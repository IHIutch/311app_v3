import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await supabase.from('reportTypes').select('*')
        if (error) {
          throw new Error(error.message)
        }
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
