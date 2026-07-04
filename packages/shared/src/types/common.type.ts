export interface LanguageString {
  [key: string]: string
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type Sorter = 'asc' | 'desc'

export type Status = 'success' | 'error'

export type Code = string

export type Message = string

export interface PaginationRequest {
  total?: number
  current?: number
  pageSize?: number
  full?: boolean
}

export type Pagination = PaginationRequest

export type IdType = string

export type Replace<T, R> = Omit<T, keyof R> & R

export interface DateRange {
  from: Date
  to: Date
}

export interface ApiSuccess<T> {
  status: 'success'
  code: Code
  data: T
  message?: Message
  meta?: Record<string, JsonValue>
}

export interface ApiError {
  status: 'error'
  code: Code
  message?: Message
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginationResponse {
  total: number
  page: number
  pageSize: number
}

export interface ResponseList<T> {
  status: 'success'
  code: Code
  data: {
    items: T[]
    pagination: PaginationResponse
  }
  message?: Message
}

export interface ResponseItem<T> {
  status: 'success'
  code: Code
  data: T
  message?: Message
}

export interface ResponseItems<T> {
  status: 'success'
  code: Code
  data: {
    items: T[]
  }
  message?: Message
}

export interface Response {
  status: 'success'
  code: Code
  message?: Message
}

export interface ListQuery<Filters, Sorters> {
  filters?: Filters
  sorters?: Sorters
  pagination?: PaginationRequest
}
