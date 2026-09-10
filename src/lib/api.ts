/**
 * Worker API 客户端（Cloudflare Worker + Hono）。
 *
 * 环境变量（见 .env）：
 * - VITE_API_BASE  Worker 地址，如 https://aurora-worker.xxx.workers.dev
 *
 * 鉴权：Clerk 登录后的会话令牌（Authorization: Bearer <__session JWT>），
 * 由 Worker 校验签名与用户白名单；前端不再打包任何静态密钥。
 */

const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

/** Clerk 挂载在 window 上的会话句柄（ClerkProvider 就绪后可用） */
interface ClerkGlobal {
  session?: {
    getToken: () => Promise<string | null>
  }
}

async function getAuthToken(): Promise<string | null> {
  const clerk = (globalThis as { Clerk?: ClerkGlobal }).Clerk
  if (!clerk?.session) return null
  try {
    return await clerk.session.getToken()
  } catch {
    return null
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    let message = `请求失败 (${res.status})`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {
      // ignore json parse error
    }
    throw new ApiError(message, res.status)
  }

  // 204 或空响应
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export { API_BASE }
