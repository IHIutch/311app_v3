import { apiGetUser, apiPostUser } from '@/controllers/users'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const data = await apiGetUser(req, res)
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    // case 'PUT':
    //   try {
    //     const { user } = req.body
    //     const data = await apiPutUser(user)
    //     res.status(resStatusType.SUCCESS).json(data)
    //   } catch (error) {
    //     console.error(error)
    //     res.status(resStatusType.BAD_REQUEST).json(error)
    //   }
    //   break

    case 'POST':
      try {
        const { user } = req.body
        const data = await apiPostUser(user)
        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
