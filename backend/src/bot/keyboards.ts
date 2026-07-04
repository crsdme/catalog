import type { CatalogCategoryDTO } from '@catalog/shared'
import { Markup } from 'telegraf'
import { categoriesInGroup, getCategoryGroups } from '@/bot/category-groups'

const PAGE_SIZE = 8

type CopyLinkButton = {
  text: string
  copy_text: { text: string }
}

function copyLinkButton(url: string): CopyLinkButton {
  return { text: '📋 Копировать ссылку', copy_text: { text: url } }
}

export function mainMenuKeyboard() {
  return Markup.keyboard([
    ['➕ Создать ссылку', '📂 Мои ссылки'],
    ['🔄 Синхронизировать Drive'],
  ]).resize()
}

function formatCategoryLabel(
  category: CatalogCategoryDTO,
  selectedIds: string[],
  photoCounts?: Record<string, number>,
) {
  const checked = selectedIds.includes(category.id) ? '✅ ' : '⬜ '
  const count = photoCounts?.[category.id]
  const countSuffix = count !== undefined ? ` (${count})` : ''
  return `${checked}${category.path}${countSuffix}`
}

export function categoryPickerKeyboard(
  categories: CatalogCategoryDTO[],
  selectedIds: string[],
  groupIndex: number,
  page: number,
  photoCounts?: Record<string, number>,
) {
  const groups = getCategoryGroups(categories)
  const currentGroup = groups[groupIndex] ?? groups[0] ?? ''
  const groupCategories = currentGroup
    ? categoriesInGroup(categories, currentGroup)
    : categories

  const start = page * PAGE_SIZE
  const slice = groupCategories.slice(start, start + PAGE_SIZE)
  const rows = slice.map((category) => {
    const label = formatCategoryLabel(category, selectedIds, photoCounts)
    return [Markup.button.callback(label.slice(0, 64), `cat:${category.id}`)]
  })

  const nav: ReturnType<typeof Markup.button.callback>[] = []
  if (page > 0)
    nav.push(Markup.button.callback('◀️', `page:${page - 1}`))
  if (start + PAGE_SIZE < groupCategories.length)
    nav.push(Markup.button.callback('▶️', `page:${page + 1}`))
  if (nav.length)
    rows.push(nav)

  const groupNav: ReturnType<typeof Markup.button.callback>[] = []
  if (groupIndex > 0)
    groupNav.push(Markup.button.callback('⬅️', `group:${groupIndex - 1}`))
  if (groupIndex < groups.length - 1)
    groupNav.push(Markup.button.callback('➡️', `group:${groupIndex + 1}`))

  if (groupNav.length)
    rows.push(groupNav)

  if (currentGroup) {
    rows.push([Markup.button.callback(`📁 ${currentGroup} (${groupIndex + 1}/${groups.length})`, 'group:noop')])
  }

  rows.push([Markup.button.callback('✔️ Готово', 'cats:done')])
  rows.push([Markup.button.callback('❌ Отмена', 'cats:cancel')])

  return Markup.inlineKeyboard(rows)
}

export function linkActionsKeyboard(linkId: string, url: string) {
  return Markup.inlineKeyboard([
    [copyLinkButton(url) as never],
    [Markup.button.callback('📋 Выборы клиента', `linksel:${linkId}`)],
    [Markup.button.callback('✏️ Изменить категории', `linkedit:${linkId}`)],
    [Markup.button.callback('🗑 Удалить ссылку', `linkdelete:${linkId}`)],
    [Markup.button.callback('◀️ Назад', 'links:back')],
  ])
}

export function createdLinkKeyboard(url: string) {
  return Markup.inlineKeyboard([
    [copyLinkButton(url) as never],
  ])
}

export { PAGE_SIZE }
