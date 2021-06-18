import { apiGetReport } from '@/controllers/reports'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { id } = req.query
        const data = await apiGetReport(id)
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

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

export default withSentry(handler)
