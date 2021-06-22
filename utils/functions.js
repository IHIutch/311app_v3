import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'
import { userType } from './types'
import { encode } from 'blurhash'

dayjs.extend(advancedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

export const formatDate = (val, format = 'MM/DD/YYYY') => {
  return dayjs(val).format(format)
}

export const formatDateFromNow = (val) => {
  return dayjs(val).fromNow()
}

export const uploadFile = async (name, file) => {
  try {
    const fileExt = name.split('.').pop()
    const filePath = `public/${uuidv4()}.${fileExt}`
    const { error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET)
      .upload(filePath, file)
    if (error) throw new Error(error)
    return filePath
  } catch (err) {
    console.log('Error uploading file: ', err.message)
  }
}

export const getPublicURL = async (path) => {
  try {
    const { publicURL, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET)
      .getPublicUrl(path)
    if (error) throw error
    return publicURL
  } catch (err) {
    console.log('Error downloading file: ', err.message)
  }
}

export const isAdmin = (user) => {
  return !user || user.type === userType.USER ? false : true
}

export const blurhashEncode = async (image) => {
  const imageUrl = URL.createObjectURL(image)
  const loadImage = async (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (...args) => reject(args)
      img.src = src
    })

  const getClampedSize = (width, height, max) => {
    if (width >= height && width > max) {
      return { width: max, height: Math.round((height / width) * max) }
    }

    if (height > width && height > max) {
      return { width: Math.round((width / height) * max), height: max }
    }

    return { width, height }
  }

  const getImageData = (image, resolutionX, resolutionY) => {
    const canvas = document.createElement('canvas')
    canvas.width = resolutionX
    canvas.height = resolutionY
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, resolutionX, resolutionY)
    return context.getImageData(0, 0, resolutionX, resolutionY)
  }

  const img = await loadImage(imageUrl)
  const clampedSize = getClampedSize(img.width, img.height, 64)
  const imageData = getImageData(img, clampedSize.width, clampedSize.height)
  const blurhash = encode(
    imageData.data,
    imageData.width,
    imageData.height,
    4,
    4
  )
  return blurhash
}
