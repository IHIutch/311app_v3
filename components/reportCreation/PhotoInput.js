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
  Icon,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { UilTimes } from '@iconscout/react-unicons'

export default function PhotoInput({ value: images, onChange }) {
  const removePhoto = (idx) => {
    const arr = [...images]
    arr.splice(idx, 1)
    onChange(arr)
  }

  const onFileChange = (e) => {
    e.preventDefault()
    const files = [...e.target.files]
      .filter((file) => {
        return file.size < 5242880 // 5MB
      })
      .slice(0, 4)
    onChange(files)
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
        {images?.length > 0 &&
          images.map((image, idx) => (
            <Box position="relative" key={idx}>
              <AspectRatio rounded="md" overflow="hidden" ratio={1}>
                <ImagePreview value={image} />
              </AspectRatio>
              <Box pos="absolute" top="0" right="0" p="1">
                <IconButton
                  rounded="full"
                  colorScheme="gray"
                  aria-label="Remove photo"
                  size="sm"
                  onClick={() => removePhoto(idx)}
                  icon={<Icon boxSize="5" as={UilTimes} />}
                />
              </Box>
            </Box>
          ))}
        {images?.length < 4 && (
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

const ImagePreview = ({ value }) => {
  const [preview, setPreview] = useState(null)
  useEffect(() => {
    const objectUrl = value ? URL.createObjectURL(value) : null
    setPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [value])

  return <Image src={preview || value} objectFit="cover" />
}
