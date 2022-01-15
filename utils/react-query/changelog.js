import { useQuery } from 'react-query'
import { getChangelog } from '../axios/changelog'

export const useGetChangelog = (params) => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ['changelog', params],
    async () => await getChangelog(params),
    {
      enabled: !!params,
    }
  )
  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
  }
}
