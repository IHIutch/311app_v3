import { supabase } from '@/utils/supabase'
import { resStatusType } from '@/utils/types'
import { withSentry } from '@sentry/nextjs'

const handler = async (req, res) => {
  const { method } = req

  switch (method) {
    case 'POST':
      const token = req.headers.token

      const { data: user, error } = await supabase.auth.api.getUser(token)

      if (error) return res.status(401).json({ error: error.message })
      return res.status(200).json(user)

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export default withSentry(handler)
