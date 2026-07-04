import { z } from 'zod'

export const numberFromStringSchema = z.preprocess((val) => {
  const num = Number(val)
  if (Number.isNaN(num)) {
    return undefined
  }
  return num
}, z.number())
