/**
 * Worker API 返回的摄影作品对象（与 aurora-worker/src/routes/photos.ts 的 Photo 一致）。
 */
export interface Photo {
  id: string
  title: string
  slug: string
  description: string | null
  category: string | null
  tags: string[]
  featured: boolean
  views: number
  likes: number
  downloads: number
  r2Key: string
  r2Url: string
  /** 展示大图（webp, w=1600） */
  displayUrl: string
  /** 列表缩略图（webp, w=400） */
  thumbUrl: string
  /** 下载原图（jpeg, 保留 EXIF） */
  downloadUrl: string
  width: number | null
  height: number | null
  fileSize: number | null
  mimeType: string | null
  cameraMake: string | null
  cameraModel: string | null
  lensMake: string | null
  lensModel: string | null
  iso: number | null
  aperture: number | null
  shutterSpeed: string | null
  focalLength: number | null
  gpsLatitude: number | null
  gpsLongitude: number | null
  gpsLocation: string | null
  date: string | null
  dateTaken: string | null
  createdAt: string
  updatedAt: string
}

/** POST/PATCH /api/photos 请求体 */
export interface PhotoInput {
  r2Key?: string
  title?: string
  slug?: string
  description?: string | null
  category?: string | null
  tags?: string[]
  featured?: boolean
  cameraMake?: string | null
  cameraModel?: string | null
  lensMake?: string | null
  lensModel?: string | null
  iso?: number | null
  aperture?: number | null
  shutterSpeed?: string | null
  focalLength?: number | null
  gpsLatitude?: number | null
  gpsLongitude?: number | null
  gpsLocation?: string | null
  date?: string | null
  dateTaken?: string | null
  width?: number | null
  height?: number | null
  fileSize?: number | null
  mimeType?: string | null
}

/** GET /api/photos 响应 */
export interface PhotosResponse {
  data: Photo[]
  total: number
  page: number
  limit: number
}

/** POST /api/upload-url 响应 */
export interface UploadUrlResponse {
  uploadUrl: string
  key: string
  r2Url: string
  expiresIn: number
}

/** 分类/标签计数项 */
export interface NameCount {
  name: string
  count: number
}

/** GET /api/stats 响应 */
export interface StatsResponse {
  total: number
  featured: number
  categories: NameCount[]
  uploadsByDay: { date: string; count: number }[]
}

/** 列表查询参数 */
export interface PhotosQuery {
  page?: number
  limit?: number
  filter?: string
  category?: string
  tag?: string
  camera?: string
  featured?: 'true' | 'false'
  hasGps?: 'true' | 'false'
}
