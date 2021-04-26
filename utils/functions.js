import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'

dayjs.extend(advancedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

export const formatDate = (val, format = 'MM/DD/YYYY') => {
  return dayjs(val).format(format)
}

export const formatDateFromNow = (val) => {
  return dayjs(val).fromNow()
}

export const uploadFile = async (file) => {
  const fileName = `public/${uuidv4()}`
  const { error } = await supabase.storage
    .from('buffalo311')
    .upload(fileName, file)
  if (error) throw new Error(error)
  return fileName
}
