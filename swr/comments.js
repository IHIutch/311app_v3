import { fetcher } from '@/hooks/swr'
import QueryString from 'qs'
import useSWR from 'swr'

export const useGetComments = ({ params = null, initialData = null }) => {
  const { data, error } = useSWR(
    `/api/comments?${QueryString.stringify(params)}`,
    fetcher,
    { initialData }
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useGetComment = async (id, { initialData = null }) => {
  const { data, error } = useSWR(`/api/comments/${id}`, fetcher, {
    initialData,
  })

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}
