import axios from 'redaxios'

export const postRegister = async (payload) => {
  try {
    const { data } = await axios
      .post(`/api/auth/register`, payload)
      .catch((res) => {
        throw new Error(res.data.error.message)
      })
    return data
  } catch (err) {
    throw new Error(err)
  }
}

export const postSignIn = async (payload) => {
  try {
    const { data } = await axios.post(`/api/auth/signin`, payload)
    // console.log(data)
    return data.user
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
