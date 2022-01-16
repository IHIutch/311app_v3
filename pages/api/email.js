import { Email1 } from '@/components/emails/email1'
import { renderEmail } from '@/utils/functions'
import { resStatusType } from '@/utils/types'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      const { title } = req.body
      const { html, text } = await renderEmail(<Email1 title={title} />)
      res.status(resStatusType.SUCCESS).send({ html, text })
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}
