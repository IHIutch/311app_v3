import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getComment, getComments, postComment } from '../axios/comments'

export const useGetComments = (params) => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ['comments', params],
    async () => await getComments(params),
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

export const useGetComment = (id) => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ['comments', id],
    async () => await getComment(id),
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

export const useCreateComment = (params) => {
  const queryClient = useQueryClient()
  const {
    mutateAsync: mutate,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  } = useMutation(postComment, {
    // When mutate is called:
    onMutate: async (updated) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(['comments', params])
      const previous = queryClient.getQueryData(['comments', params])
      queryClient.setQueryData(['comments', params], (old) => {
        return [...old, updated]
      })
      return { previous, updated }
    },
    // If the mutation fails, use the context we returned above
    onError: (err, updated, context) => {
      queryClient.setQueryData(['comments', params], context.previous)
    },
    // Always refetch after error or success:
    onSettled: (updated) => {
      queryClient.invalidateQueries(['comments', params])
    },
  })
  return {
    mutate,
    data,
    error,
    isLoading,
    isError,
    isSuccess,
  }
}
