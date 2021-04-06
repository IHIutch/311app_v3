import dayjs from 'dayjs'

export const formatDate = (val, format = 'MM/DD/YYYY') => {
  return dayjs(val).format(format)
}
