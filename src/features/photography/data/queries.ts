import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type {
  NameCount,
  Photo,
  PhotoInput,
  PhotosQuery,
  PhotosResponse,
  StatsResponse,
  UploadUrlResponse,
} from './types'

export const photoKeys = {
  all: ['photos'] as const,
  list: (query: PhotosQuery) => [...photoKeys.all, 'list', query] as const,
  detail: (id: string) => [...photoKeys.all, 'detail', id] as const,
  categories: ['photos', 'categories'] as const,
  tags: ['photos', 'tags'] as const,
  stats: ['photos', 'stats'] as const,
}

export function usePhotosQuery(query: PhotosQuery) {
  return useQuery({
    queryKey: photoKeys.list(query),
    queryFn: async () => {
      const search = new URLSearchParams()
      if (query.page) search.set('page', String(query.page))
      if (query.limit) search.set('limit', String(query.limit))
      if (query.filter) search.set('filter', query.filter)
      if (query.category) search.set('category', query.category)
      if (query.tag) search.set('tag', query.tag)
      if (query.camera) search.set('camera', query.camera)
      if (query.featured) search.set('featured', query.featured)
      if (query.hasGps) search.set('hasGps', query.hasGps)
      return api.get<PhotosResponse>(`/api/photos?${search.toString()}`)
    },
    // 对话框打开/关闭引发的窗口焦点变化不应触发列表刷新
    refetchOnWindowFocus: false,
  })
}

export function usePhotoQuery(id: string | undefined) {
  return useQuery({
    queryKey: photoKeys.detail(id ?? ''),
    queryFn: () => api.get<Photo>(`/api/photos/${id}`),
    enabled: !!id,
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: photoKeys.categories,
    queryFn: () => api.get<NameCount[]>('/api/categories'),
    refetchOnWindowFocus: false,
  })
}

export function useTagsQuery() {
  return useQuery({
    queryKey: photoKeys.tags,
    queryFn: () => api.get<NameCount[]>('/api/tags'),
    refetchOnWindowFocus: false,
  })
}

export function useStatsQuery() {
  return useQuery({
    queryKey: photoKeys.stats,
    queryFn: () => api.get<StatsResponse>('/api/stats'),
  })
}

function useInvalidatePhotos() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: photoKeys.all })
  }
}

/** 创建作品元数据 */
export function useCreatePhoto() {
  const invalidate = useInvalidatePhotos()
  return useMutation({
    mutationFn: (input: PhotoInput) =>
      api.post<Photo>('/api/photos', input),
    onSuccess: () => {
      toast.success('作品创建成功')
      invalidate()
    },
    onError: (error) => toast.error(`创建失败：${error.message}`),
  })
}

/** 更新作品元数据 */
export function useUpdatePhoto() {
  const invalidate = useInvalidatePhotos()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PhotoInput }) =>
      api.patch<Photo>(`/api/photos/${id}`, input),
    onSuccess: () => {
      toast.success('作品已更新')
      invalidate()
    },
    onError: (error) => toast.error(`更新失败：${error.message}`),
  })
}

/** 删除作品（Worker 同时清理 R2 文件） */
export function useDeletePhoto() {
  const invalidate = useInvalidatePhotos()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/photos/${id}`),
    onSuccess: () => {
      toast.success('作品已删除（R2 文件已同步清理）')
      invalidate()
    },
    onError: (error) => toast.error(`删除失败：${error.message}`),
  })
}

/** 完整上传流程封装：成功后自动刷新作品缓存 */
export function useUploadPhoto() {
  const invalidate = useInvalidatePhotos()
  return useMutation({
    mutationFn: ({ file, input }: { file: File; input: PhotoInput }) =>
      uploadPhoto(file, input),
    onSuccess: () => {
      toast.success('上传成功，原图已存入 R2（EXIF 完整保留）')
      invalidate()
    },
    onError: (error) => toast.error(`上传失败：${error.message}`),
  })
}

/**
 * 完整上传流程：
 * 1. 获取 R2 预签名上传 URL
 * 2. 直接 PUT 图片到 R2（原图，保留 EXIF）
 * 3. 提交 r2Key + 元数据到 Worker 写入 Supabase
 */
export async function uploadPhoto(
  file: File,
  input: PhotoInput
): Promise<Photo> {
  // 1. 预签名 URL
  const { uploadUrl, key } = await api.post<UploadUrlResponse>(
    '/api/upload-url',
    { filename: file.name }
  )

  // 2. 直传 R2（不带 Content-Type，保持 R2 默认；EXIF 完整保留在原图中）
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
  })
  if (!putRes.ok) {
    throw new Error(`上传到 R2 失败 (${putRes.status})`)
  }

  // 3. 写入元数据
  return api.post<Photo>('/api/photos', { ...input, r2Key: key })
}
