/**
 * 创建/删除一个测试作品，用于浏览器 UI 渲染验证。
 * 用法: node scripts/test-photo.mjs create|cleanup
 */
import exifr from 'exifr'
import { readFileSync, writeFileSync } from 'node:fs'

const API_BASE = 'https://aurora-worker.bbbboy811.workers.dev'
const ADMIN_API_KEY = 'aurora-admin-7a57749aa7ef4fb1a0e2c0cba81c035d'
const FILE = 'test-photo.jpg'
const ID_FILE = '.test-photo-id'
const headers = { 'x-api-key': ADMIN_API_KEY }

const cmd = process.argv[2] ?? 'create'

if (cmd === 'create') {
  const exif = await exifr.parse(FILE, { tiff: true, exif: true, gps: true })
  const presignRes = await fetch(`${API_BASE}/api/upload-url`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: FILE }),
  })
  const presign = await presignRes.json()
  await fetch(presign.uploadUrl, {
    method: 'PUT',
    body: readFileSync(FILE),
  })
  const createRes = await fetch(`${API_BASE}/api/photos`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      r2Key: presign.key,
      title: 'UI 渲染验证作品',
      description: '用于浏览器表格渲染验证',
      category: 'street',
      tags: ['测试'],
      featured: true,
      cameraMake: exif.Make,
      cameraModel: exif.Model,
      iso: exif.ISO,
      aperture: exif.FNumber,
      focalLength: exif.FocalLength,
      fileSize: readFileSync(FILE).length,
      mimeType: 'image/jpeg',
      dateTaken: new Date(exif.DateTimeOriginal).toISOString(),
    }),
  })
  const photo = await createRes.json()
  writeFileSync(ID_FILE, photo.id)
  console.log(`created: ${photo.id}`)
} else if (cmd === 'cleanup') {
  const id = readFileSync(ID_FILE, 'utf-8').trim()
  const res = await fetch(`${API_BASE}/api/photos/${id}`, {
    method: 'DELETE',
    headers,
  })
  console.log(`deleted ${id}: ${res.status}`)
}
