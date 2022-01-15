import axios from 'redaxios'

export const getChangelogs = async (params = null) => {
  console.log({ params })
  try {
    const { data } = await axios.get('/api/changelog', {
      params,
    })
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const getChangelog = async (params = null) => {
  console.log({ params })
  try {
    const { data } = await axios.get(`/api/changelog`, {
      params,
    })
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const postChangelog = async (payload) => {
  try {
    const { data } = await axios.post(`/api/changelog`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const putChangelog = async (id, payload) => {
  try {
    const { data } = await axios.put(`/api/changelog/${id}`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const deleteChangelog = async (id) => {
  try {
    const { data } = await axios.delete(`/api/changelog/${id}`)
    return data
  } catch (err) {
    throw new Error(err)
  }
}
