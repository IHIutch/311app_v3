import { apiGetReport } from '@/controllers/reports'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return apiGetReport(req, res)

    // case 'POST':
    //   return createReport(req, res)

    // case 'PUT':
    //   return putReport(req, res)

    // case 'DELETE':
    //   return deleteReport(req, res)

    default:
      res.setHeader('Allow', ['GET'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
