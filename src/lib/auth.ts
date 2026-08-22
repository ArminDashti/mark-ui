export type User = {
  id: string
  email: string
  username: string
  created_at: string
  updated_at: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type MarkKind = 'logo' | 'icon'

export type MarkRow = {
  id: string
  kind: MarkKind
  slug: string
  name: string
  original_mime: string
  width: number
  height: number
  has_alpha: boolean
  created_at: string
  updated_at: string
}

const TOKEN_KEY = 'mark-token'
const USER_KEY = 'mark-user'

export const API_BASE = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (raw !== undefined && raw !== '') return raw.replace(/\/$/, '')
  return (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
})()

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function markImageUrl(kind: MarkKind, slug: string, size = 128): string {
  return `${API_BASE}/m/${kind}/${encodeURIComponent(slug)}?size=${size}`
}

async function parseError(response: Response): Promise<string> {
  let message = `Request failed (${response.status})`
  try {
    const data = (await response.json()) as { error?: string }
    if (data.error) message = data.error
  } catch {
    /* ignore */
  }
  return message
}

async function apiFetch<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(options.headers)
  const isForm = options.body instanceof FormData
  if (!isForm && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = getToken()
    if (!token) throw new Error('Not authenticated')
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!response.ok) {
    throw new Error(await parseError(response))
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export function login(body: { username: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchMarks(kind: MarkKind, q = ''): Promise<MarkRow[]> {
  const params = new URLSearchParams({ kind })
  const query = q.trim()
  if (query) params.set('q', query)
  return apiFetch<MarkRow[]>(`/api/v1/marks?${params.toString()}`, {}, true)
}

export function createMark(form: FormData): Promise<MarkRow> {
  return apiFetch<MarkRow>(
    '/api/v1/marks',
    {
      method: 'POST',
      body: form,
    },
    true,
  )
}

export function updateMark(id: string, form: FormData): Promise<MarkRow> {
  return apiFetch<MarkRow>(
    `/api/v1/marks/${id}`,
    {
      method: 'PUT',
      body: form,
    },
    true,
  )
}

export function deleteMark(id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/marks/${id}`, { method: 'DELETE' }, true)
}
