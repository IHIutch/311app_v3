import supabase from '@/utils/supabase'

export const apiGetComments = async ({ objectType, objectId }) => {
  const { data, error } = await supabase
    .from('Comments')
    .select('*, User: userId (firstName, lastName)')
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
    .from('Comments')
    .insert([
      {
        userId,
        content,
        objectType,
        objectId,
      },
    ])
    .select('*, User: userId (firstName, lastName)')

  if (error) {
    throw new Error(error.message)
  }
  return data
}
