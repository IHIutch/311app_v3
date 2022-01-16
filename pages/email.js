import { Button } from '@chakra-ui/button'
import React from 'react'
import axios from 'redaxios'

export default function email() {
  const handleButtonClick = async () => {
    const { data } = await axios.post(`/api/email`, {
      title: 'this is a test',
    })
    console.log(data)
  }

  return (
    <div>
      <Button onClick={handleButtonClick}>Click</Button>
    </div>
  )
}
