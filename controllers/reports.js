import { supabase } from '@/utils/supabase'
import { reportStatusType, resStatusType } from '@/utils/types'

export const apiGetReports = async (req, res) => {
  try {
    const { data, error } = await supabase.from('reports').select(`
    *,
    reportType: reportTypeId (
      name, group, markerColor
    )`)

    if (error) {
      throw new Error(error.message)
    }
    res.status(resStatusType.SUCCESS).json(data)
  } catch (error) {
    console.error(error)
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
}

export const apiPostReport = async (req, res) => {
  try {
    const { photos, ...report } = req.body
    const { data, error } = await supabase.from('reports').insert([
      {
        status: reportStatusType.CREATED,
        ...report,
      },
    ])

    if (error) {
      console.log(error.message)
      throw new Error(error.message)
    }
    res.status(resStatusType.SUCCESS).json(data[0])
  } catch (error) {
    res.status(resStatusType.BAD_REQUEST).json(error)
  }
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
