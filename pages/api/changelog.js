import { apiGetChangelog } from '@/controllers/changelog'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { objectType, objectId } = req.query
        const data = await apiGetChangelog({ objectType, objectId })

        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
