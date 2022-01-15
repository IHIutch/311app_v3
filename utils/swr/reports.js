import QueryString from 'qs'
import useSWR from 'swr'

export const useGetReports = ({ params = null, initialData = null }) => {
  const { data, error } = useSWR(
    `/api/reports?${QueryString.stringify(params)}`,
    { initialData }
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useGetReport = (id, { initialData = null }) => {
  const { data, error, mutate } = useSWR(`/api/reports/${id}`, { initialData })
  return {
    data,
    mutate,
    isLoading: !error && !data,
    isError: error,
  }
}