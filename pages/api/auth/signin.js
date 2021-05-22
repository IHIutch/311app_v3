import { apiPostSignInUser } from '@/controllers/users'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      return apiPostSignInUser(req, res)

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
