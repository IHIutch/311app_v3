import React from 'react'
import { Icon, Text, HStack } from '@chakra-ui/react'
import { reportStatusType } from '@/utils/types'

import {
  UilLockOpenAlt,
  UilSchedule,
  UilSearchAlt,
  UilHardHat,
  UilCheckCircle,
} from '@iconscout/react-unicons'

export default function StatusIndicator({
  status,
  size = 'md',
  showIcon = true,
  showText = true,
}) {
  const statusSize =
    size === 'sm'
      ? {
          iconSize: '5',
          fontSize: 'sm',
          spacing: '1',
        }
      : {
          iconSize: '6',
          fontSize: 'md',
          spacing: '2',
        }

  return (
    <>
      {status === reportStatusType.CREATED && (
        <HStack
          align="center"
          fontWeight="medium"
          color="green.600"
          spacing={statusSize.spacing}
        >
          {showIcon && (
            <Icon boxSize={statusSize.iconSize} as={UilLockOpenAlt} />
          )}
          {showText && <Text fontSize={statusSize.fontSize}>Open</Text>}
        </HStack>
      )}
      {status === reportStatusType.IN_REVIEW && (
        <HStack
          alignItems="center"
          fontWeight="medium"
          color="blue.600"
          spacing={statusSize.spacing}
        >
          {showIcon && <Icon boxSize={statusSize.iconSize} as={UilSearchAlt} />}
          {showText && <Text fontSize={statusSize.fontSize}>In Review</Text>}
        </HStack>
      )}
      {status === reportStatusType.ASSIGNED && (
        <HStack
          alignItems="center"
          fontWeight="medium"
          color="orange.600"
          spacing={statusSize.spacing}
        >
          {showIcon && <Icon boxSize={statusSize.iconSize} as={UilHardHat} />}
          {showText && <Text fontSize={statusSize.fontSize}>Assigned</Text>}
        </HStack>
      )}
      {status === reportStatusType.SCHEDULED && (
        <HStack
          alignItems="center"
          fontWeight="medium"
          color="purple.600"
          spacing={statusSize.spacing}
        >
          {showIcon && <Icon boxSize={statusSize.iconSize} as={UilSchedule} />}
          {showText && <Text fontSize={statusSize.fontSize}>Scheduled</Text>}
        </HStack>
      )}
      {status === reportStatusType.CLOSED && (
        <HStack
          alignItems="center"
          fontWeight="medium"
          color="red.600"
          spacing={statusSize.spacing}
        >
          {showIcon && (
            <Icon boxSize={statusSize.iconSize} as={UilCheckCircle} />
          )}
          {showText && <Text fontSize={statusSize.fontSize}>Closed</Text>}
        </HStack>
      )}
    </>
  )
}
