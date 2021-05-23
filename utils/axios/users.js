import axios from 'redaxios'

export const getUser = async (id) => {
  try {
    const { data } = await axios
      .get(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/users/${id}`)
      .catch((res) => {
        throw new Error(res.data.error.message)
      })
    return data
  } catch (err) {
    throw new Error(err)
  }
}
