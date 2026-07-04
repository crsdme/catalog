import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

// ---------------------------------------------------------------------------
// URL param helpers (parsers / serializers)
// ---------------------------------------------------------------------------

export function parseQueryString(value: string | null | undefined, fallback = ''): string {
  return value ?? fallback
}

export function parseQueryInt(value: string | null | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function parseQueryCsv(value: string | null | undefined): string[] {
  return value ? value.split(',').map(s => s.trim()).filter(Boolean) : []
}

interface QueryParamWriter {
  set: (key: string, value: string) => void
  delete: (key: string) => void
}

export function setQueryParam(
  sp: QueryParamWriter,
  key: string,
  value: string | number | null | undefined,
): void {
  if (value === undefined || value === null || value === '')
    sp.delete(key)
  else sp.set(key, String(value))
}

export function setQueryParamCsv(
  sp: QueryParamWriter,
  key: string,
  values?: string[] | null,
): void {
  const clean = (values ?? []).map(v => v?.trim?.() ?? v).filter(Boolean)
  if (!clean.length)
    sp.delete(key)
  else sp.set(key, clean.join(','))
}

// ---------------------------------------------------------------------------
// Sort format: "id:asc,id2:desc"
// ---------------------------------------------------------------------------

export type SortDirection = 'asc' | 'desc'
export type SortingState = Array<{ id: string, desc: boolean }>

function parseSort(raw: string | null): SortingState {
  if (!raw?.trim())
    return []
  return raw
    .split(',')
    .map((part) => {
      const [id, dir] = part.trim().split(':')
      if (!id)
        return null
      return { id, desc: (dir ?? 'asc').toLowerCase() === 'desc' }
    })
    .filter((x): x is { id: string, desc: boolean } => x !== null)
}

function serializeSort(sorting: SortingState): string {
  if (!Array.isArray(sorting))
    return ''
  return sorting.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(',')
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PaginationState {
  current: number
  pageSize: number
}

export type SortersMap = Record<string, SortDirection>

export interface UseListQueryStateOptions<F extends Record<string, unknown>> {
  defaults: {
    pagination?: PaginationState
    filters?: F
    sorting?: SortingState
  }
  readFilters: (sp: FilterSearchParams) => Partial<F>
  writeFilters: (sp: FilterSearchParams, filters: Partial<F>) => void
  namespace?: string
}

/** TanStack Table passes (prev) => newState; we accept both the array and the updater. */
export type SortingUpdater = SortingState | ((prev: SortingState) => SortingState)

export interface UseListQueryStateReturn<F extends Record<string, unknown>> {
  pagination: PaginationState
  setPagination: (patch: Partial<PaginationState>) => void
  sorting: SortingState
  setSorting: (sortingOrUpdater: SortingUpdater) => void
  sorters: SortersMap
  filters: F
  setFilters: (patch: Partial<F>) => void
  reset: () => void
}

const SYS_KEYS = ['page', 'pageSize', 'sort'] as const

export interface FilterSearchParams extends QueryParamWriter {
  get: (key: string) => string | undefined
}

// ---------------------------------------------------------------------------
// Defaults for "no options" usage
// ---------------------------------------------------------------------------

type AnyFilters = Record<string, unknown>

const DEFAULTS: UseListQueryStateOptions<AnyFilters> = {
  namespace: undefined,
  defaults: {
    pagination: { current: 1, pageSize: 10 },
    sorting: [],
    filters: {},
  },
  readFilters: () => ({}),
  writeFilters: () => { },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePrefix(namespace?: string) {
  const ns = namespace?.trim()
  return (key: string) => (ns ? `${ns}_${key}` : key)
}

function pickNamespaced(searchParams: URLSearchParams, prefix: (k: string) => string): URLSearchParams {
  const out = new URLSearchParams()
  const p = prefix('')

  searchParams.forEach((v, k) => {
    if (p) {
      if (k.startsWith(p))
        out.set(k.slice(p.length), v)
    }
    else {
      out.set(k, v)
    }
  })
  return out
}

function applyNamespaced(
  target: URLSearchParams,
  prefix: (k: string) => string,
  mutate: (ns: URLSearchParams) => void,
) {
  const ns = pickNamespaced(target, prefix)
  mutate(ns)

  const p = prefix('')
  const targetKeys: string[] = []
  target.forEach((_, k) => targetKeys.push(k))
  if (p) {
    targetKeys.forEach((k) => {
      if (k.startsWith(p))
        target.delete(k)
    })
  }
  else {
    targetKeys.forEach(k => target.delete(k))
  }

  ns.forEach((v, k) => target.set(prefix(k), v))
}

function createFilterSearchParams(params: URLSearchParams): FilterSearchParams {
  return {
    get: (key: string) => params.get(key) ?? undefined,
    set: (key: string, value: string | number | null | undefined) => {
      setQueryParam(params, key, value)
    },
    delete: (key: string) => params.delete(key),
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useListQueryState<F extends Record<string, unknown> = Record<string, unknown>>(
  options?: Partial<UseListQueryStateOptions<F>>,
): UseListQueryStateReturn<F> {
  const [searchParams, setSearchParams] = useSearchParams()

  // merge shallow: enough for our shape; no deep merge needed besides defaults.{...}
  const merged = useMemo(() => {
    const o = options ?? {}
    const d = o.defaults ?? ({} as UseListQueryStateOptions<F>['defaults'])

    return {
      namespace: o.namespace ?? DEFAULTS.namespace,
      defaults: {
        pagination: d.pagination ?? (DEFAULTS.defaults.pagination as unknown as PaginationState),
        sorting: d.sorting ?? (DEFAULTS.defaults.sorting as unknown as SortingState),
        filters: (d.filters ?? (DEFAULTS.defaults.filters as unknown as AnyFilters)) as F,
      },
      readFilters: (o.readFilters ?? (DEFAULTS.readFilters as any)) as UseListQueryStateOptions<F>['readFilters'],
      writeFilters: (o.writeFilters ?? (DEFAULTS.writeFilters as any)) as UseListQueryStateOptions<F>['writeFilters'],
    } satisfies UseListQueryStateOptions<F>
  }, [options])

  const prefix = useMemo(() => makePrefix(merged.namespace), [merged.namespace])

  const nsParams = useMemo(
    () => pickNamespaced(searchParams, prefix),
    [searchParams, prefix],
  )

  const pagination = useMemo<PaginationState>(() => {
    const d = merged.defaults.pagination
    return {
      current: parseQueryInt(nsParams.get('page'), d.current),
      pageSize: parseQueryInt(nsParams.get('pageSize'), d.pageSize),
    }
  }, [nsParams, merged.defaults.pagination])

  const sorting = useMemo<SortingState>(() => {
    const parsed = parseSort(nsParams.get('sort'))
    return parsed.length ? parsed : merged.defaults.sorting
  }, [nsParams, merged.defaults.sorting])

  const filters = useMemo<F>(() => {
    const fromUrl = merged.readFilters(createFilterSearchParams(nsParams))
    return { ...merged.defaults.filters, ...fromUrl } as F
  }, [nsParams, merged.defaults.filters, merged.readFilters])

  const updateQuery = useCallback(
    (mutate: (ns: URLSearchParams) => void, replace: boolean) => {
      const next = new URLSearchParams(searchParams)
      applyNamespaced(next, prefix, mutate)
      setSearchParams(next, { replace })
    },
    [searchParams, setSearchParams, prefix],
  )

  const setPagination = useCallback(
    (patch: Partial<PaginationState>) => {
      updateQuery((ns) => {
        const current = patch.current ?? pagination.current
        const pageSize = patch.pageSize ?? pagination.pageSize
        setQueryParam(ns, 'page', current)
        setQueryParam(ns, 'pageSize', pageSize)
      }, false)
    },
    [updateQuery, pagination],
  )

  const setSorting = useCallback(
    (sortingOrUpdater: SortingUpdater) => {
      const nextSorting = typeof sortingOrUpdater === 'function'
        ? sortingOrUpdater(sorting)
        : sortingOrUpdater
      updateQuery((ns) => {
        setQueryParam(ns, 'sort', serializeSort(nextSorting) || null)
        setQueryParam(ns, 'page', 1)
      }, true)
    },
    [updateQuery, sorting],
  )

  const setFilters = useCallback(
    (patch: Partial<F>) => {
      updateQuery((ns) => {
        const mergedFilters = { ...filters, ...patch } as F
        merged.writeFilters(createFilterSearchParams(ns), mergedFilters)
        // Don't keep empty filter params in URL
        const emptyKeys: string[] = []
        ns.forEach((val, key) => {
          if (val === '' || val === undefined || val === null || val === 'null')
            emptyKeys.push(key)
        })
        emptyKeys.forEach(k => ns.delete(k))
        setQueryParam(ns, 'page', 1)
      }, true)
    },
    [updateQuery, filters, merged.writeFilters],
  )

  const reset = useCallback(() => {
    updateQuery((ns) => {
      SYS_KEYS.forEach(k => ns.delete(k))
      merged.writeFilters(createFilterSearchParams(ns), merged.defaults.filters)
      const emptyKeys: string[] = []
      ns.forEach((val, key) => {
        if (val === '')
          emptyKeys.push(key)
      })
      emptyKeys.forEach(k => ns.delete(k))
    }, true)
  }, [updateQuery, merged.writeFilters, merged.defaults.filters])

  const sorters = useMemo<SortersMap>(
    () => Object.fromEntries(sorting.map(({ id, desc }) => [id, desc ? 'desc' : 'asc'])),
    [sorting],
  )

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    sorters,
    filters,
    setFilters,
    reset,
  }
}

export { useListQueryState as useEntityListState }
