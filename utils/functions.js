import dayjs from 'dayjs'
import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'

export const formatDate = (val, format = 'MM/DD/YYYY') => {
  return dayjs(val).format(format)
}

export const uploadFile = async (file) => {
  const fileName = `public/${uuidv4()}`
  const { error } = await supabase.storage
    .from('buffalo311')
    .upload(fileName, file)
  if (error) throw new Error(error)
  return fileName
}
