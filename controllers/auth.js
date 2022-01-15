import supabase from '@/utils/supabase'
import { apiGetUser } from './users'

export const getLoggedUser = async (req) => {
  const { user: loggedUser } = await supabase.auth.api.getUserByCookie(req)
  if (!loggedUser) return null

  const user = await apiGetUser(loggedUser.id)

  return {
    ...loggedUser,
    ...user,
  }
}
