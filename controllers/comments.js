import supabase from '@/utils/supabase'

export const apiGetComments = async ({ objectType, objectId }) => {
  const { data, error } = await supabase
    .from('Comments')
    .select('*, User: creatorId (firstName, lastName)')
    .eq('objectType', objectType)
    .eq('objectId', Number(objectId))

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiPostComment = async ({
  creatorId,
  content,
  objectType,
  objectId,
}) => {
  const { data, error } = await supabase
    .from('Comments')
    .insert([
      {
        creatorId,
        content,
        objectType,
        objectId,
      },
    ])
    .select('*, User: creatorId (firstName, lastName)')

  if (error) {
    throw new Error(error.message)
  }
  return data
}
