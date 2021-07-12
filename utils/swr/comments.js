import QueryString from 'qs'
import useSWR, { mutate } from 'swr'

export const useGetComments = ({ params = null, initialData = null }) => {
  const { data, error, mutate } = useSWR(
    `/api/comments?${QueryString.stringify(params)}`,
    { initialData }
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}

export const usePostComment = (payload, { params = null }) => {
  mutate(`/api/comments?${QueryString.stringify(params)}`, payload)
}

export const useGetComment = async (id, { initialData = null }) => {
  const { data, error } = useSWR(`/api/comments/${id}`, { initialData })

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}
