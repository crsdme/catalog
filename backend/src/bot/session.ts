import type { CatalogCategoryDTO } from '@catalog/shared'

export type BotStep =
  | 'idle'
  | 'awaiting_client_name'
  | 'selecting_categories'
  | 'editing_categories'

export interface BotSession {
  step: BotStep
  clientName: string
  label: string
  selectedCategoryIds: string[]
  editingLinkId?: string
  categoryPage: number
  categoryGroupIndex: number
  catalogId?: string
  categories?: CatalogCategoryDTO[]
  photoCounts?: Record<string, number>
}

const sessions = new Map<string, BotSession>()

export function getSession(telegramId: string): BotSession {
  const existing = sessions.get(telegramId)
  if (existing)
    return existing

  const session: BotSession = {
    step: 'idle',
    clientName: '',
    label: '',
    selectedCategoryIds: [],
    categoryPage: 0,
    categoryGroupIndex: 0,
  }
  sessions.set(telegramId, session)
  return session
}

export function resetSession(telegramId: string) {
  sessions.set(telegramId, {
    step: 'idle',
    clientName: '',
    label: '',
    selectedCategoryIds: [],
    categoryPage: 0,
    categoryGroupIndex: 0,
    catalogId: undefined,
    categories: undefined,
    photoCounts: undefined,
  })
}

export function toggleCategory(session: BotSession, categoryId: string) {
  const set = new Set(session.selectedCategoryIds)
  if (set.has(categoryId))
    set.delete(categoryId)
  else
    set.add(categoryId)
  session.selectedCategoryIds = [...set]
}
