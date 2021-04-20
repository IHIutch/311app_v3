import { deleteReport, getReports, putReport } from '../../controllers/reports'
import { supabase } from '../../utils/supabase'
import { resStatusType, reportStatusType } from '../../utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return getReports(req, res)

    case 'POST':
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
      break

    case 'PUT':
      return putReport(req, res)

    case 'DELETE':
      return deleteReport(req, res)

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
