/**
 * E2E 验证上传流程（与后台 UI 相同的调用链）：
 * 1. exifr 解析 EXIF
 * 2. POST /api/upload-url 获取 R2 预签名 URL
 * 3. PUT 直传 R2（原图，保留 EXIF）
 * 4. POST /api/photos 写入元数据
 * 5. GET /api/photos 验证列表
 * 6. PATCH 验证编辑
 * 7. 验证 R2 原图可访问（EXIF 保留）
 * 8. DELETE 验证删除（DB + R2 同步清理）
 */
import exifr from 'exifr'
import { readFileSync } from 'node:fs'

const API_BASE = 'https://aurora-worker.bbbboy811.workers.dev'
const ADMIN_API_KEY = 'aurora-admin-7a57749aa7ef4fb1a0e2c0cba81c035d'
const FILE = 'test-photo.jpg'

const headers = { 'x-api-key': ADMIN_API_KEY }
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`)
}

// 1. EXIF 解析
const exif = await exifr.parse(FILE, { tiff: true, exif: true, gps: true })
check('exifr 解析 EXIF', !!exif?.Make, `Make=${exif?.Make}, Model=${exif?.Model}, ISO=${exif?.ISO}, F=${exif?.FNumber}, GPS=${exif?.latitude?.toFixed(3)},${exif?.longitude?.toFixed(3)}`)

// 2. 预签名 URL
const presignRes = await fetch(`${API_BASE}/api/upload-url`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: FILE }),
})
const presign = await presignRes.json()
check('POST /api/upload-url', presignRes.ok && !!presign.uploadUrl, `key=${presign.key}`)

// 3. 直传 R2
const fileBuf = readFileSync(FILE)
const putRes = await fetch(presign.uploadUrl, {
  method: 'PUT',
  body: fileBuf,
})
check('PUT 直传 R2', putRes.ok, `status=${putRes.status}`)

// 4. 写入元数据（与 UI uploadPhoto 相同的字段映射）
const shutter = exif.ExposureTime >= 1 ? `${exif.ExposureTime}s` : `1/${Math.round(1 / exif.ExposureTime)}`
const createRes = await fetch(`${API_BASE}/api/photos`, {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    r2Key: presign.key,
    title: 'E2E 测试作品',
    description: 'Node E2E 上传流程验证',
    category: 'street',
    tags: ['测试', '街拍'],
    featured: true,
    cameraMake: exif.Make,
    cameraModel: exif.Model,
    lensModel: exif.LensModel,
    iso: exif.ISO,
    aperture: exif.FNumber,
    shutterSpeed: shutter,
    focalLength: exif.FocalLength,
    gpsLatitude: exif.latitude,
    gpsLongitude: exif.longitude,
    dateTaken: new Date(exif.DateTimeOriginal).toISOString(),
    width: exif.ExifImageWidth ?? exif.ImageWidth,
    height: exif.ExifImageHeight ?? exif.ImageHeight,
    fileSize: fileBuf.length,
    mimeType: 'image/jpeg',
  }),
})
const photo = await createRes.json()
check('POST /api/photos', createRes.ok && !!photo.id, `id=${photo.id}, slug=${photo.slug}`)

// 5. 列表验证
const listRes = await fetch(`${API_BASE}/api/photos?tag=街拍`)
const list = await listRes.json()
check('GET /api/photos?tag=街拍', listRes.ok && list.total === 1 && list.data[0].title === 'E2E 测试作品')

// 6. 编辑验证
const patchRes = await fetch(`${API_BASE}/api/photos/${photo.id}`, {
  method: 'PATCH',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'E2E 测试作品 v2', category: 'landscape' }),
})
const patched = await patchRes.json()
check('PATCH /api/photos/:id', patchRes.ok && patched.title === 'E2E 测试作品 v2' && patched.category === 'landscape')

// 7. R2 原图可访问 + EXIF 保留验证
const r2Res = await fetch(photo.r2Url)
const r2Buf = Buffer.from(await r2Res.arrayBuffer())
const r2Exif = await exifr.parse(r2Buf, { tiff: true, exif: true, gps: true })
check('R2 原图可访问且 EXIF 完整', r2Res.ok && r2Exif?.Make === 'TestCam' && r2Exif?.ISO === 400, `bytes=${r2Buf.length}, Make=${r2Exif?.Make}, ISO=${r2Exif?.ISO}`)

// 8. 删除验证（DB + R2 同步清理）
const delRes = await fetch(`${API_BASE}/api/photos/${photo.id}`, {
  method: 'DELETE',
  headers,
})
const delJson = await delRes.json()
check('DELETE /api/photos/:id', delRes.ok && delJson.success === true)

const r2After = await fetch(photo.r2Url)
check('R2 文件已同步删除', r2After.status === 404, `status=${r2After.status}`)

const listAfter = await fetch(`${API_BASE}/api/photos`)
const listAfterJson = await listAfter.json()
check('数据库记录已删除', listAfterJson.total === 0)

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} 通过`)
process.exit(failed.length ? 1 : 0)
