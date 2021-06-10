import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'

export const apiGetComments = async (req, res) => {
  const { objectType, objectId } = req.query
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*, user: userId (firstName, lastName)')
      .eq('objectType', objectType)
      .eq('objectId', Number(objectId))

    if (error) {
      throw new Error(error.message)
    }
    res.status(resStatusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
}

export const apiPostComment = async (req, res) => {
  try {
    const { userId, content, objectType, objectId } = req.body
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
      console.log(error.message)
      throw new Error(error.message)
    }
    res.status(resStatusType.SUCCESS).json(data[0])
  } catch (error) {
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
}
