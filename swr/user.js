import { fetcher } from '@/hooks/swr'
import { supabase } from '@/utils/supabase'
import useSWR from 'swr'

export const useAuthUser = () => {
  const user = supabase.auth.user()
  const { data, error } = useSWR(user ? `/api/users/${user.id}` : null, fetcher)

  return {
    data: {
      ...user,
      ...data,
    },
    isLoading: !error && !data,
    isError: error,
  }
}
