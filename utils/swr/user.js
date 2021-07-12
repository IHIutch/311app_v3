import { supabase } from '@/utils/supabase'
import useSWR from 'swr'

export const useAuthUser = ({ initialData = null }) => {
  const user = supabase.auth.user()
  const { data, error } = useSWR(user ? `/api/users/${user.id}` : null, {
    initialData,
  })

  return {
    data:
      user && data
        ? {
            ...user,
            ...data,
          }
        : null,
    isLogged: user || data,
    isLoading: !error && !data,
    isError: error,
  }
}
