import supabase from '@/utils/supabase'

export const apiGetReportTypes = async () => {
  const { data, error } = await supabase.from('reportTypes').select('*')

  if (error) {
    throw new Error(error.message)
  }
  return data
}
