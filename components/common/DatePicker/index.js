import React from 'react'
import ReactDatePicker from 'react-datepicker'
import { useColorMode } from '@chakra-ui/react'

import 'react-datepicker/dist/react-datepicker.css'

const DatePicker = ({
  selectedDate,
  onChange,
  isClearable = false,
  showPopperArrow = false,
  ...props
}) => {
  const { colorMode } = useColorMode()
  return (
    // if you don't want to use chakra's colors or you just wwant to use the original ones,
    // set className to "light-theme-original" ↓↓↓↓
    <div className={colorMode === 'light' ? 'light-theme' : 'dark-theme'}>
      <ReactDatePicker
        selected={selectedDate}
        onChange={onChange}
        isClearable={isClearable}
        showPopperArrow={showPopperArrow}
        className="react-datapicker__input-text" //input is white by default and there is no already defined class for it so I created a new one
        {...props}
      />
    </div>
  )
}

export default DatePicker
