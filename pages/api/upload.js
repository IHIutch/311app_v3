import { resStatusType } from '@/utils/types'

import { handleImageReq, uploadFile } from '@/utils/api/uploads'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const { name, file } = await handleImageReq(req)
        const filePath = await uploadFile(name, file)

        res.status(resStatusType.SUCCESS).json(filePath)
      } catch (error) {
        console.error(error)
        res.status(resStatusType.BAD_REQUEST).json(error)
      }
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(resStatusType.NOT_ALLOWED).end(`Method ${method} Not Allowed`)
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
