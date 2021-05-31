import { apiPostRegisterUser } from '@/controllers/users'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const { email, password } = req.body
        const { user, session } = await apiPostRegisterUser({ email, password })
        return res.status(resStatusType.SUCCESS).json({ user, session })
      } catch (error) {
        return res.status(resStatusType.BAD_REQUEST).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
