import {
  Button,
  Box,
  Grid,
  GridItem,
  VisuallyHidden,
  Text,
  AspectRatio,
  Image,
  IconButton,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function PhotoInput() {
  const [photos, setPhotos] = useState([])

  const removePhoto = (idx) => {
    const arr = [...photos]
    arr.splice(idx, 1)
    setPhotos(arr)
  }

  const onFileChange = (e) => {
    e.preventDefault()
    const files = [...e.target.files].slice(0, 4)
    files
      .filter((file) => {
        return file.size < 5242880 // 5MB
      })
      .forEach((file) => {
        let reader = new FileReader()
        reader.onload = (e) => {
          setPhotos((prev) => [
            ...prev,
            {
              file,
              fileType: file.type,
              fileName: file.name,
              base64String: e.target.result,
            },
          ])
        }
        reader.readAsDataURL(file)
      })
  }

  return (
    <>
      <VisuallyHidden
        id="photos"
        as="input"
        type="file"
        multiple
        accept="image"
        aria-describedby="photo-helptext"
        onChange={onFileChange}
      />
      <Grid templateColumns="repeat(3, 1fr)" gap="4">
        {photos &&
          photos.length > 0 &&
          photos.map((p, idx) => (
            <Box position="relative" key={idx}>
              <AspectRatio ratio={1}>
                <Image src={p.base64String} objectFit="cover" />
              </AspectRatio>
              <IconButton
                pos="absolute"
                top="0"
                right="0"
                rounded="full"
                colorScheme="gray"
                aria-label="Remove photo"
                //   icon={ }
                onClick={() => removePhoto(idx)}
              />
            </Box>
          ))}
        {photos && photos.length < 4 && (
          <GridItem as={AspectRatio} ratio={1}>
            <Button as="label" htmlFor="photos">
              <Box>
                <Text>Add</Text>
              </Box>
            </Button>
          </GridItem>
        )}
      </Grid>
      <Text id="photo-helptext" fontSize="sm" color="gray.500" mt="2">
        Upload up to 4 images, 5MB each
      </Text>
    </>
  )
}
