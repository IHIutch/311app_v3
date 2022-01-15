import supabase from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { getPublicURL } from '../functions'
import formidable from 'formidable'

export const uploadFile = async (name, file) => {
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET

  const fileExt = name.split('.').pop()
  const filePath = `${uuidv4()}.${fileExt}`
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file)
  if (error) throw new Error(error.message)

  return await getPublicURL(filePath)
}

export const handleImageReq = async (req) => {
  const parseFile = async () => {
    return await new Promise((resolve, reject) => {
      const form = formidable({})
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve({
          name: files.file[0].originalFilename,
          file: fs.readFileSync(files.file[0].filepath),
        })
      })
    })
  }
  return await parseFile()
}
