import {
  apiGetComments,
  apiPostComment,
  //   apiPutComment,
  //   apiDeleteComment,
} from '@/controllers/comments'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { objectType, objectId } = req.query
        const data = await apiGetComments({ objectType, objectId })

        res.status(resStatusType.SUCCESS).json(data)
      } catch (error) {
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    case 'POST':
      try {
        const { userId, content, objectType, objectId } = req.body
        const data = await apiPostComment({
          userId,
          content,
          objectType,
          objectId,
        })

        res.status(resStatusType.SUCCESS).json(data[0])
      } catch (error) {
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    // case 'PUT':
    //   return apiPutComment(req, res)

    // case 'DELETE':
    //   return apiDeleteComment(req, res)

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
