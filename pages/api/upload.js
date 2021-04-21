import { supabase } from '../../utils/supabase'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      const { file, name } = req.body
      const { data, error } = await supabase.storage
        .from('buffalo311')
        .upload(`public/${name}`, file)
      if (error) {
        console.log(error)
        //   throw new Error(error)
      }
      return data

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
