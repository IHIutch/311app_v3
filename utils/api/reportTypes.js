import axios from 'redaxios'

export const getReportTypes = async () => {
  try {
    const { data } = await axios.get(`/api/reportTypes`)
    return data
  } catch (err) {
    throw new Error(err)
  }
}
