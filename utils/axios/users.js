import axios from 'redaxios'

export const getUser = async (id) => {
  try {
    const { data } = await axios.get(`/api/users/${id}`).catch((res) => {
      throw new Error(res.data.error.message)
    })
    return data
  } catch (err) {
    throw new Error(err)
  }
}
