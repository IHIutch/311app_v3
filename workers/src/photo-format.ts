export const photoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function photoType(header: Uint8Array) {
  const startsWith = (bytes: number[], offset = 0) =>
    bytes.every((byte, index) => header[index + offset] === byte)

  if (startsWith([255, 216, 255])) return 'image/jpeg'
  if (startsWith([137, 80, 78, 71, 13, 10, 26, 10])) return 'image/png'
  if (startsWith([82, 73, 70, 70]) && startsWith([87, 69, 66, 80], 8)) return 'image/webp'
  if (startsWith([71, 73, 70, 56, 55, 97]) || startsWith([71, 73, 70, 56, 57, 97])) return 'image/gif'
  return null
}
