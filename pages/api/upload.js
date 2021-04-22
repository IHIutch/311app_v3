import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'
import axios from 'redaxios'
import { v4 as uuidv4 } from 'uuid'
import FormData from 'form-data'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const file = req.body
        const fileName = uuidv4()
        const bucketName = 'buffalo311'
        const path = `${supabase.storage.url}/object/${bucketName}/public/${fileName}`
        const headers = supabase.storage.headers

        const formData = new FormData()
        formData.append('', file, fileName)

        const { error } = await axios.post(path, formData, {
          headers,
        })
        if (error) throw new Error(error)
        res.status(resStatusType.SUCCESS).json(fileName)
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
