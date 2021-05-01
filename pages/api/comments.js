import {
  apiGetComments,
  apiPostComment,
  //   apiPutComment,
  //   apiDeleteComment,
} from '@/controllers/comments'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return apiGetComments(req, res)

    case 'POST':
      return apiPostComment(req, res)

    // case 'PUT':
    //   return apiPutComment(req, res)

    // case 'DELETE':
    //   return apiDeleteComment(req, res)

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
