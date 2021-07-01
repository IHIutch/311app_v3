import { supabase } from '@/utils/supabase'

export const apiPostChangelog = async (payload = []) => {
  const { data, error } = await supabase.from('changelog').insert(payload)

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiGetChangelog = async ({ objectType, objectId }) => {
  const { data, error } = await supabase
    .from('changelog')
    .select('*')
    .eq('objectType', objectType)
    .eq('objectId', parseInt(objectId))

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const handleCreateChangelog = async (
  payload = {},
  { userId, objectType, objectId }
) => {
  const { data, error } = await supabase
    .from(objectType)
    .select('*')
    .match({ id: objectId })
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const changes = Object.entries(payload).map(([k, v]) => {
    return {
      userId,
      objectType,
      objectId,
      objectAttr: k,
      oldValue: data[k],
      newValue: v,
    }
  })
  return await apiPostChangelog(changes)
}
