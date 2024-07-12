import { useQuery } from 'react-query'
import { getUser } from '../axios/users'

export const useAuthUser = async () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ['user'],
    async () => await getUser()
  )
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  }
}
