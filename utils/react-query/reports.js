import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getReport, getReports, postReport, putReport } from '../axios/reports'

export const useGetReports = (params) => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ['reports', params],
    async () => await getReports(params),
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

export const useGetReport = (id) => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ['reports', id],
    async () => await getReport(id),
    {
      enabled: !!id,
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

export const useCreateReport = (params) => {
  const queryClient = useQueryClient()
  const { mutate, isLoading, isError, isSuccess, data, error } = useMutation(
    postReport,
    {
      // When mutate is called:
      onMutate: async (updated) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['reports', params])
        const previous = queryClient.getQueryData(['reports', params])
        queryClient.setQueryData(['reports', params], (old) => {
          return [...old, updated]
        })
        return { previous, updated }
      },
      // If the mutation fails, use the context we returned above
      onError: (err, updated, context) => {
        queryClient.setQueryData(['reports', params], context.previous)
      },
      // Always refetch after error or success:
      onSettled: (updated) => {
        queryClient.invalidateQueries(['reports', params])
      },
    }
  )
  return {
    mutate,
    data,
    error,
    isLoading,
    isError,
    isSuccess,
  }
}

export const useUpdateReport = (params) => {
  const queryClient = useQueryClient()
  const { mutate, isLoading, isError, isSuccess, data, error } = useMutation(
    async ({ id, payload }) => {
      await putReport(id, payload)
    },
    {
      // When mutate is called:
      onMutate: async ({ payload }) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['reports', params])
        const previous = queryClient.getQueryData(['reports', params])
        queryClient.setQueryData(['reports', params], (old) => ({
          ...old,
          ...payload,
        }))
        return { previous, payload }
      },
      // If the mutation fails, use the context we returned above
      onError: (err, updated, context) => {
        queryClient.setQueryData(['reports', params], context.previous)
      },
      // Always refetch after error or success:
      onSettled: (updated) => {
        queryClient.invalidateQueries(['reports', params])
      },
    }
  )
  return {
    mutate,
    data,
    error,
    isLoading,
    isError,
    isSuccess,
  }
}
