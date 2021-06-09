import { apiPostRegisterUser } from '@/controllers/users'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const { session, userData } = req.body
        return await apiPostRegisterUser(req, res, { session, userData })
      } catch (error) {
        return res.status(resStatusType.BAD_REQUEST).json({ error })
      }

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
