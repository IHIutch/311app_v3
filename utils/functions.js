import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'
import { userType } from './types'

dayjs.extend(advancedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET

export const formatDate = (val, format = 'MM/DD/YYYY') => {
  return dayjs(val).format(format)
}

export const formatDateFromNow = (val) => {
  return dayjs(val).fromNow()
}

export const uploadFile = async (name, file) => {
  try {
    const fileExt = name.split('.').pop()
    const filePath = `public/${uuidv4()}.${fileExt}`
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file)
    if (error) throw new Error(error)
    return filePath
  } catch (err) {
    console.log('Error uploading file: ', err.message)
  }
}

export const downloadFile = async (path) => {
  try {
    const { signedURL, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 3600)
    if (error) throw error
    return signedURL
  } catch (err) {
    console.log('Error downloading file: ', err.message)
  }
}

export const isAdmin = (user) => {
  return !user || user.type === userType.USER ? false : true
}
