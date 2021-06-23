import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'

export const apiGetComments = async ({ objectType, objectId }) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user: userId (firstName, lastName)')
    .eq('objectType', objectType)
    .eq('objectId', Number(objectId))

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiPostComment = async ({
  userId,
  content,
  objectType,
  objectId,
}) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        userId,
        content,
        objectType,
        objectId,
      },
    ])
    .select('*, user: userId (firstName, lastName)')

  if (error) {
    throw new Error(error.message)
  }
  return data
}
