import {
  apiGetReports,
  apiPostReport,
  apiPutReport,
  apiDeleteReport,
} from '@/controllers/reports'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const data = await apiGetReports()
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    case 'POST':
      return apiPostReport(req, res)

    case 'PUT':
      return apiPutReport(req, res)

    case 'DELETE':
      return apiDeleteReport(req, res)

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
