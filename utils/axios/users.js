import axios from 'redaxios'

export const getUser = async () => {
  try {
    const { data } = await axios.get(`/api/users`).catch((res) => {
      throw new Error(res.data.error.message)
    })
    return data
  } catch (err) {
    throw new Error(err)
  }
}
