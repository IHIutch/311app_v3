import { supabase } from '@/utils/supabase'
import axios from 'redaxios'
import { v4 as uuidv4 } from 'uuid'
import FormData from 'form-data'
import formidable from 'formidable-serverless'
import fs from 'fs'

export const uploadFile = async (name, file) => {
  const fileExt = name.split('.').pop()
  const filePath = `public/${uuidv4()}.${fileExt}`
  const bucketName = 'buffalo311'
  const url = `${supabase.storage.url}/object/${bucketName}/${filePath}`
  const headers = supabase.storage.headers

  const formData = new FormData()
  formData.append('file', file, filePath)

  const { error } = await axios.post(url, formData, {
    headers,
  })
  if (error) throw new Error(error)
  return filePath
}

export const handleImageReq = async (req) => {
  const getFileName = async () => {
    const form = new formidable.IncomingForm()
    form.uploadDir = 'public/uploads'
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
  return { name, file }
}
