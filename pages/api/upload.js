import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'
import axios from 'redaxios'
import { v4 as uuidv4 } from 'uuid'
import FormData from 'form-data'
import formidable from 'formidable'
import fs from 'fs'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const getFileName = async () => {
          const form = new formidable.IncomingForm()
          form.uploadDir = './'
          form.keepExtensions = true
          return await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
              if (err) reject(err)
              resolve({
                name: files.file.name,
                path: files.file.path,
                file: fs.readFileSync(files.file.path),
              })
            })
          })
        }
        const { name, path, file } = await getFileName()
        fs.unlinkSync(path)

        const fileExt = name.split('.').pop()
        const fileName = `public/${uuidv4()}.${fileExt}`
        const bucketName = 'buffalo311'
        const url = `${supabase.storage.url}/object/${bucketName}/${fileName}`
        const headers = supabase.storage.headers

        const formData = new FormData()
        formData.append('file', file, fileName)

        const { error } = await axios.post(url, formData, {
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

export const config = {
  api: {
    bodyParser: false,
  },
}
