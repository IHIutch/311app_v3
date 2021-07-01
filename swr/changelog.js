import { fetcher } from '@/hooks/swr'
import QueryString from 'qs'
import useSWR from 'swr'

export const useGetChangelog = ({ params = null, initialData = null }) => {
  const { data, error, mutate } = useSWR(
    `/api/changelog?${QueryString.stringify(params)}`,
    fetcher,
    {
      initialData,
    }
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
