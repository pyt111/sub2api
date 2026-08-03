import axios from 'axios'
import type { ApiResponse } from '@/types'
import { getAPIBaseURL } from '@/api/url'

export interface RefreshedSession {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

let refreshSessionPromise: Promise<RefreshedSession> | null = null

function clearExpiredSession(): void {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('auth_user')
  localStorage.removeItem('token_expires_at')
  sessionStorage.setItem('auth_expired', '1')

  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login'
  }
}

/**
 * 全局复用同一次续期请求，避免一次性 refresh token 被并发轮换。
 */
export function refreshSession(): Promise<RefreshedSession> {
  if (refreshSessionPromise) {
    return refreshSessionPromise
  }

  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token available'))
  }

  refreshSessionPromise = axios
    .post<ApiResponse<RefreshedSession>>(
      `${getAPIBaseURL()}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        withCredentials: true,
      }
    )
    .then(({ data: response }) => {
      if (response.code !== 0 || !response.data) {
        throw new Error(response.message || 'Token refresh failed')
      }

      const session = response.data
      localStorage.setItem('auth_token', session.access_token)
      localStorage.setItem('refresh_token', session.refresh_token)
      localStorage.setItem('token_expires_at', String(Date.now() + session.expires_in * 1000))
      return session
    })
    .catch((error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearExpiredSession()
      }
      throw error
    })
    .finally(() => {
      refreshSessionPromise = null
    })

  return refreshSessionPromise
}
