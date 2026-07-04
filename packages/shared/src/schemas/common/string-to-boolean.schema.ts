import { z } from 'zod'

export const stringToBooleanSchema = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true'
  }
  return val
}, z.boolean())
