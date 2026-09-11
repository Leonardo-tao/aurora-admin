/**
 * 上传一条测试摄影作品并保留（用于前台联调），幂等：同名 slug 存在则跳过。
 * 流程与 e2e-upload-flow.mjs 一致：预签名 → 直传 R2 → 写元数据。
 * 用法: node scripts/seed-test-photo.mjs [图片路径] [slug] [标题]
 */
import exifr from 'exifr'
import { readFileSync, existsSync } from 'node:fs'

const API_BASE = 'https://aurora-worker.codercat.top'
const ADMIN_API_KEY = 'aurora-admin-7a57749aa7ef4fb1a0e2c0cba81c035d'
const FILE = process.argv[2] ?? 'test-photo.jpg'
const SLUG = process.argv[3] ?? 'e2e-seed-test'
const TITLE = process.argv[4] ?? 'E2E Seed 测试作品'
const headers = { 'x-api-key': ADMIN_API_KEY }

if (!existsSync(FILE)) {
  console.error(`图片不存在: ${FILE}，先运行 node scripts/make-test-jpeg.mjs ${FILE}`)
  process.exit(1)
}

// 已存在同名作品则跳过（幂等）
const existRes = await fetch(`${API_BASE}/api/photos/${SLUG}`)
if (existRes.ok) {
  const existing = await existRes.json()
  console.log('已存在测试作品，跳过上传:', JSON.stringify(existing, null, 2))
  process.exit(0)
}

const exif = (await exifr.parse(FILE, { tiff: true, exif: true, gps: true })) ?? {}
const fileBuf = readFileSync(FILE)

// 1. 预签名 URL
const presignRes = await fetch(`${API_BASE}/api/upload-url`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: FILE }),
})
const presignJson = await presignRes.json()
if (!presignRes.ok) throw new Error(`预签名失败: ${JSON.stringify(presignJson)}`)
const presign = presignJson.data

// 2. 直传 R2
const putRes = await fetch(presign.uploadUrl, { method: 'PUT', body: fileBuf })
if (!putRes.ok) throw new Error(`R2 直传失败: ${putRes.status}`)

// 3. 写元数据
const shutter =
  exif.ExposureTime >= 1 ? `${exif.ExposureTime}s` : `1/${Math.round(1 / exif.ExposureTime)}`
const createRes = await fetch(`${API_BASE}/api/photos`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    r2Key: presign.key,
    title: TITLE,
    slug: SLUG,
    description: '前台对接联调用的种子数据（带 EXIF）',
    category: 'street',
    tags: ['测试', '街拍'],
    featured: true,
    cameraMake: exif.Make ?? null,
    cameraModel: exif.Model ?? null,
    lensMake: exif.LensMake ?? null,
    lensModel: exif.LensModel ?? null,
    iso: exif.ISO ?? null,
    aperture: exif.FNumber ?? null,
    shutterSpeed: shutter ?? null,
    focalLength: exif.FocalLength ?? null,
    gpsLatitude: exif.latitude ?? null,
    gpsLongitude: exif.longitude ?? null,
    dateTaken: exif.DateTimeOriginal ? new Date(exif.DateTimeOriginal).toISOString() : null,
    width: exif.ExifImageWidth ?? exif.ImageWidth ?? 800,
    height: exif.ExifImageHeight ?? exif.ImageHeight ?? 600,
    fileSize: fileBuf.length,
    mimeType: FILE.endsWith('.png') ? 'image/png' : 'image/jpeg',
  }),
})
const photoJson = await createRes.json()
if (!createRes.ok) throw new Error(`写入元数据失败: ${JSON.stringify(photoJson)}`)
const photo = photoJson.data

console.log('上传成功:', JSON.stringify(photo, null, 2))
process.exit(0)
