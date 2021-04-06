import supabase from '../utils/supabase'
import { statusType } from '../utils/types'

export const getReports = async (req, res) => {
  try {
    const { data, error } = await supabase.from('reports').select(`
    *,
    reportType: reportTypeId (
      name, group, markerColor
    )`)

    if (error) {
      throw new Error(error.message)
    }
    res.status(statusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(statusType.BAD_REQUEST).json(error)
  }
}

export const getReport = async (req, res) => {
  try {
    const { report } = req.body
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .match({ id: report.id })
      .single()

    if (error) {
      throw new Error(error)
    }
    res.status(statusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(statusType.BAD_REQUEST).json(error)
  }
}

export const createReport = async (req, res) => {
  try {
    const { report } = req.body
    const { data, error } = await supabase.from('reports').insert(report)

    if (error) {
      throw new Error(error)
    }
    res.status(statusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(statusType.BAD_REQUEST).json(error)
  }
}

export const updateReport = async (req, res) => {
  try {
    const { report } = req.body
    const { data, error } = await supabase
      .from('reports')
      .update({ report })
      .match({ id: report.id })

    if (error) {
      throw new Error(error)
    }
    res.status(statusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(statusType.BAD_REQUEST).json(error)
  }
}

export const deleteReport = async (req, res) => {
  try {
    const { report } = req.body
    const { data, error } = await supabase
      .from('reports')
      .delete()
      .match({ id: report.id })

    if (error) {
      throw new Error(error)
    }
    res.status(statusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(statusType.BAD_REQUEST).json(error)
  }
}
