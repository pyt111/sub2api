import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'

describe('登录会话续期', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('并发续期只轮换一次 refresh token', async () => {
    localStorage.setItem('auth_token', 'expired-token')
    localStorage.setItem('refresh_token', 'refresh-token')

    let resolveRefresh!: (value: any) => void
    const post = vi.spyOn(axios, 'post').mockImplementation(
      () => new Promise((resolve) => {
        resolveRefresh = resolve
      })
    )
    const { refreshSession } = await import('./sessionRefresh')

    const first = refreshSession()
    const second = refreshSession()

    expect(first).toBe(second)
    expect(post).toHaveBeenCalledTimes(1)

    resolveRefresh({
      data: {
        code: 0,
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
        },
        message: 'ok',
      },
    })

    await expect(Promise.all([first, second])).resolves.toEqual([
      expect.objectContaining({ access_token: 'new-access-token' }),
      expect.objectContaining({ access_token: 'new-access-token' }),
    ])
    expect(localStorage.getItem('auth_token')).toBe('new-access-token')
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token')
  })
})
