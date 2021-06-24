import { supabase } from '@/utils/supabase'
import { reportStatusType, resStatusType } from '@/utils/types'

export const apiGetReports = async () => {
  const { data, error } = await supabase.from('reports').select(`
    *,
    reportType: reportTypeId (
      name, group, markerColor
    )`)

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiGetReport = async (id) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*, reportType: reportTypeId (name, group, markerColor)')
    .match({ id })
    .single()

  if (error) {
    throw new Error(error)
  }
  return data
}

export const apiPostReport = async (payload) => {
  const { data, error } = await supabase.from('reports').insert([
    {
      status: reportStatusType.CREATED,
      ...payload,
    },
  ])

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiPutReport = async (req, res) => {
  try {
    const { report } = req.body
    const { data, error } = await supabase
      .from('reports')
      .update({ report })
      .match({ id: report.id })

    if (error) {
      throw new Error(error)
    }
    res.status(resStatusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
}

export const apiDeleteReport = async (req, res) => {
  try {
    const { report } = req.body
    const { data, error } = await supabase
      .from('reports')
      .delete()
      .match({ id: report.id })

    if (error) {
      throw new Error(error)
    }
    res.status(resStatusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
}
