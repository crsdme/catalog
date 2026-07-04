export class HttpError extends Error {
  public statusCode: number
  public code: string
  public description: string

  constructor(statusCode: number, message: string, code = 'INTERNAL_ERROR', description = '') {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.code = code
    this.description = description
    Error.captureStackTrace(this, this.constructor)
  }
}
