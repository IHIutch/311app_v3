import QueryString from 'qs'
import axios from 'redaxios'

export const getReports = async (params = null) => {
  try {
    const { data } = await axios.get(
      `/api/reports?` + QueryString.stringify(params)
    )
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const getReport = async (id) => {
  try {
    const { data } = await axios.get(`/api/reports/${id}`)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const postReport = async (payload) => {
  try {
    const { data } = await axios.post(`/api/reports`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const putReport = async (id, payload) => {
  try {
    const { data } = await axios.put(`/api/reports/${id}`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const deleteReport = async (id) => {
  try {
    const { data } = await axios.delete(`/api/reports/${id}`)
    return data
  } catch (err) {
    throw new Error(err)
  }
}
