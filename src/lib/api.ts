/**
 * Worker API 客户端（Cloudflare Worker + Hono）。
 *
 * 环境变量（见 .env）：
 * - VITE_API_BASE       Worker 地址，如 https://aurora-worker.xxx.workers.dev
 * - VITE_ADMIN_API_KEY  后台管理密钥（与 Worker 的 ADMIN_API_KEY secret 一致）
 */

const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY ?? ''

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
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ADMIN_API_KEY,
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
