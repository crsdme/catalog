import type { CatalogCategoryDTO } from '@catalog/shared'

export function getCategoryGroup(path: string): string {
  const parts = path.split('/').filter(Boolean)
  if (parts.length <= 2)
    return parts.join('/')
  return parts.slice(0, 2).join('/')
}

export function getCategoryGroups(categories: CatalogCategoryDTO[]): string[] {
  const groups = new Set<string>()
  for (const category of categories) {
    if (category.path === '_root')
      continue
    groups.add(getCategoryGroup(category.path))
  }
  return [...groups].sort((a, b) => a.localeCompare(b))
}

export function categoriesInGroup(
  categories: CatalogCategoryDTO[],
  group: string,
): CatalogCategoryDTO[] {
  return categories.filter((category) => {
    if (category.path === '_root')
      return false
    return getCategoryGroup(category.path) === group
  })
}
