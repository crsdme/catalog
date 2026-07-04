export function resolvePagination(pagination?: { current?: unknown, pageSize?: unknown, full?: boolean }) {
  const current = Number(pagination?.current ?? 1)
  const pageSize = pagination?.full ? 10000 : Number(pagination?.pageSize ?? 10)
  return { current, pageSize, offset: (current - 1) * pageSize }
}
