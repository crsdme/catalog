import path from 'node:path'

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const

export const STORAGE_PATH = path.resolve('storage')

export const STORAGE_PATHS = {
  uploads: path.join(STORAGE_PATH, 'uploads'),
  temp: path.join(STORAGE_PATH, 'temp'),
} as const

export const DEFAULT_SETTINGS = [
  { key: 'app:name', value: 'Catalog', scope: 'app', description: 'Application name', isPublic: true },
  { key: 'app:defaultLanguage', value: 'en', scope: 'app', description: 'Default language', isPublic: true },
]
