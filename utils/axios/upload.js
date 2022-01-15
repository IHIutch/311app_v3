import axios from 'redaxios'
export const postUpload = async (formData) => {
  const { data } = await axios.post('/api/uploads', formData).catch((res) => {
    throw new Error(res.data.error)
  })
  return data
}
