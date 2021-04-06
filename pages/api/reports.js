import {
  deleteReport,
  getReports,
  postReport,
  putReport,
} from '../../controllers/reports'
import { statusType } from '../../utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return getReports(req, res)

    case 'POST':
      return postReport(req, res)

    case 'PUT':
      return putReport(req, res)

    case 'DELETE':
      return deleteReport(req, res)

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(statusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
