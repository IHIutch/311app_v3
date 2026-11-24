import { useEffect, useRef, useState } from 'react'

function PhotoPreview({ photo }: { photo: File }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])
  return url ? <img src={url} alt={photo.name} /> : null
}

export function ReportPhotoInput() {
  const input = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')

  function updatePhotos(next: File[]) {
    const transfer = new DataTransfer()
    for (const photo of next) transfer.items.add(photo)
    if (input.current) input.current.files = transfer.files
    setPhotos(next)
  }

  return (
    <>
      <label>Photos (up to three, 5 MB each)
        <input ref={input} name="photo" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={event => {
            const next = [...photos, ...Array.from(event.target.files ?? [])]
            if (next.length > 3 || next.some(photo => photo.size > 5 * 1024 * 1024)) {
              updatePhotos(photos)
              setError('Choose up to three photos, each 5 MB or smaller.')
              return
            }
            setError('')
            updatePhotos(next)
          }} />
      </label>
      {error && <p role="alert">{error}</p>}
      {photos.length > 0 && <ul className="photos photo-previews">{photos.map((photo, index) => (
        <li key={index}>
          <PhotoPreview photo={photo} />
          <button type="button" onClick={() => {
            setError('')
            updatePhotos(photos.filter((_, position) => position !== index))
          }}>Remove {photo.name}</button>
        </li>
      ))}</ul>}
    </>
  )
}
