import supabase from '@/utils/supabase'
import { reportStatusType } from '@/utils/types'

export const apiGetReports = async (params = {}) => {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `*,
      reportType: reportTypeId (
      name, group, markerColor
      )`
    )
    .match(params)
    .order('id')

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
    throw new Error(error.message)
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

export const apiPutReport = async (id, payload) => {
  const { data, error } = await supabase
    .from('reports')
    .update(payload)
    .match({ id })
    .select('*, reportType: reportTypeId (name, group, markerColor)')

  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const apiDeleteReport = async (id) => {
  const { data, error } = await supabase.from('reports').delete().match({ id })

  if (error) {
    throw new Error(error.message)
  }
  return data
}
