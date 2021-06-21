import { fetcher } from '@/hooks/swr'
import QueryString from 'qs'
import useSWR from 'swr'

export const useGetReports = ({ params = null, initialData = null }) => {
  const { data, error } = useSWR(
    `/api/reports?${QueryString.stringify(params)}`,
    fetcher,
    { initialData }
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useGetReport = async (id, { initialData = null }) => {
  const { data, error } = useSWR(`/api/reports/${id}`, fetcher, { initialData })

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}
