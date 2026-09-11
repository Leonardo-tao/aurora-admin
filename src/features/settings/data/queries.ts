import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export interface UrlItem {
  value: string
}

export interface UserProfile {
  bio: string
  urls: UrlItem[]
}

export interface UserSettings {
  name: string
  /** ISO 日期字符串（yyyy-MM-dd）或 null */
  dateOfBirth: string | null
  language: string
  theme: 'light' | 'dark'
  accent: string
  notifications: Record<string, unknown>
  displayItems: string[]
}

export const settingsKeys = {
  all: ['settings'] as const,
  profile: ['settings', 'profile'] as const,
  user: ['settings', 'user'] as const,
}

/** 读取当前用户资料（bio/urls；username/email 由 Clerk 管理，不入库） */
export function useUserProfileQuery() {
  return useQuery({
    queryKey: settingsKeys.profile,
    queryFn: () => api.get<UserProfile>('/api/user-profile'),
  })
}

/** 保存用户资料（bio/urls），成功后用服务器返回值更新缓存 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserProfile) =>
      api.patch<UserProfile>('/api/user-profile', input),
    onSuccess: (data) => {
      toast.success('个人资料已保存')
      queryClient.setQueryData(settingsKeys.profile, data)
    },
    onError: (error) => toast.error(`保存失败：${error.message}`),
  })
}

/** 读取当前用户设置（无记录时服务器返回默认值） */
export function useUserSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.user,
    queryFn: () => api.get<UserSettings>('/api/user-settings'),
  })
}

/** 部分更新用户设置（Worker 端按字段合并后 upsert） */
export function useUpdateUserSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<UserSettings>) =>
      api.patch<UserSettings>('/api/user-settings', input),
    onSuccess: (data) => {
      toast.success('设置已保存')
      queryClient.setQueryData(settingsKeys.user, data)
    },
    onError: (error) => toast.error(`保存失败：${error.message}`),
  })
}
