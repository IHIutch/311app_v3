import { handleCreateChangelog } from '@/controllers/changelog'
import {
  apiDeleteReport,
  apiGetReport,
  apiPutReport,
} from '@/controllers/reports'
import supabase from '@/utils/supabase'
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

    case 'PUT':
      try {
        const { id } = req.query
        const payload = req.body

        const { user, error } = await supabase.auth.api.getUserByCookie(req)
        if (error) {
          throw new Error(error.message)
        }
        await handleCreateChangelog(payload, {
          userId: user.id,
          objectType: 'reports',
          objectId: id,
        })

        const data = await apiPutReport(id, payload)

        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    case 'DELETE':
      try {
        const { id } = req.query
        const data = await apiDeleteReport(id)
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
