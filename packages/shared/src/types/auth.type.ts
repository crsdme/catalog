export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    login: string
    name: string
    permissions: string[]
    settings: { key: string, value: string }[]
    createdAt: Date
    updatedAt: Date
  }
}

export interface RefreshResponse {
  accessToken: string
  permissions: string[]
}
