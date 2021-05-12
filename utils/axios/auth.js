import axios from 'redaxios'

export const postRegister = async (payload) => {
  try {
    const { data } = await axios.post(`/api/auth/register`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const postLogin = async (payload) => {
  try {
    const { data } = await axios.post(`/api/auth/login`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const postForgotPassword = async (payload) => {
  try {
    const { data } = await axios.post(`/api/auth/forgot-password`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const postUpdatePassword = async (payload) => {
  try {
    const { data } = await axios.post(`/api/auth/update-password`, payload)
    return data
  } catch (err) {
    throw new Error(err)
  }
}
