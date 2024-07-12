import supabase from '@/utils/supabase'
import { apiGetUser } from './users'

export const getLoggedUser = async (req) => {
  const {
    data: { user: loggedUser },
  } = await supabase.auth.getUser()
  if (!loggedUser) return null

  const user = await apiGetUser(loggedUser.id)

  return {
    ...loggedUser,
    ...user,
  }
}
