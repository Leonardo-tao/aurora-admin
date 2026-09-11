/**
 * Worker API 返回的摄影作品对象（与 aurora-worker/src/routes/photos.ts 的 Photo 一致）。
 * 按语义分区：根节点基础元信息 + urls / file / exif。
 */
export interface PhotoUrls {
  /** R2 原图直链 */
  r2: string
  /** 展示大图（webp, w=1600） */
  display: string
  /** 列表缩略图（webp, w=400） */
  thumb: string
  /** 下载原图（jpeg, 保留 EXIF） */
  download: string
}

export interface PhotoFile {
  r2Key: string
  size: number | null
  mimeType: string | null
}

export interface PhotoExif {
  width: number | null
  height: number | null
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
  dateTaken: string | null
}

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
  date: string | null
  createdAt: string
  updatedAt: string
  urls: PhotoUrls
  file: PhotoFile
  exif: PhotoExif
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

/** GET /api/photos 响应（解包后的 data） */
export interface PhotosResponse {
  items: Photo[]
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
