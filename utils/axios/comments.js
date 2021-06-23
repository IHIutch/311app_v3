import QueryString from 'qs'
import axios from 'redaxios'

export const getComments = async (params = null) => {
  try {
    const { data } = await axios.get(
      `/api/comments?` + QueryString.stringify(params)
    )
    return data
  } catch (err) {
    throw new Error(err)
  }
}

// export const getComment = async (id) => {
//   try {
//     const { data } = await axios.get(`/api/comments/${id}`)
//     return data
//   } catch (err) {
//     throw new Error(err)
//   }
// }

export const postComment = async (payload) => {
  try {
    const { data } = await axios.post(`/api/comments`, payload)
    return data
  } catch (err) {
    console.log(err)
    throw new Error(err)
  }
}

// export const putComment = async (id, payload) => {
//   try {
//     const { data } = await axios.put(`/api/comments/${id}`, payload)
//     return data
//   } catch (err) {
//     throw new Error(err)
//   }
// }

// export const deleteComment = async (id) => {
//   try {
//     const { data } = await axios.delete(`/api/comments/${id}`)
//     return data
//   } catch (err) {
//     throw new Error(err)
//   }
// }
