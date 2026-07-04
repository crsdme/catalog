import fs from 'node:fs'
import { STORAGE_PATH, STORAGE_PATHS } from './constants'

export function initStorageDirectories() {
  Object.values(STORAGE_PATHS).forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true })
  })
  fs.mkdirSync(STORAGE_PATH, { recursive: true })
}
