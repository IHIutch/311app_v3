import supabase from '@/utils/supabase'
import { useQuery } from 'react-query'
import { getUser } from '../axios/users'

export const useAuthUser = () => {
  const user = supabase.auth.user()
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ['user'],
    async () => {
      return user ? await getUser(user.id) : null
    }
  )
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  }
}
