/**
 * 生成一张带 EXIF 元数据的最小 JPEG 测试图（1x1，含相机/镜头/GPS 信息）。
 * 用法: node scripts/make-test-jpeg.mjs <输出路径>
 */
import { writeFileSync } from 'node:fs'

// 标准 1x1 JPEG（含 JFIF/量化/霍夫曼表，可正常解码）
const BASE64 =
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9oACAEBAAA/APn+v//Z'
const jpeg = Buffer.from(BASE64, 'base64')

const TYPES = { ASCII: 2, SHORT: 3, LONG: 4, RATIONAL: 5 }
const TYPE_SIZES = { 2: 1, 3: 2, 4: 4, 5: 8 }

const ascii = (s) => Buffer.concat([Buffer.from(s, 'ascii'), Buffer.from([0])])
const rationals = (pairs) => {
  const b = Buffer.alloc(pairs.length * 8)
  pairs.forEach(([n, d], i) => {
    b.writeUInt32BE(n, i * 8)
    b.writeUInt32BE(d, i * 8 + 4)
  })
  return b
}

/** entry: { tag, type, count, value?, block? } block 为超长数据 */
const gpsEntries = [
  { tag: 0x0001, type: TYPES.ASCII, count: 2, value: ascii('N') },
  {
    tag: 0x0002,
    type: TYPES.RATIONAL,
    count: 3,
    block: rationals([
      [39, 1],
      [54, 1],
      [5000, 100],
    ]),
  },
  { tag: 0x0003, type: TYPES.ASCII, count: 2, value: ascii('E') },
  {
    tag: 0x0004,
    type: TYPES.RATIONAL,
    count: 3,
    block: rationals([
      [116, 1],
      [23, 1],
      [3000, 100],
    ]),
  },
]

const exifEntries = [
  { tag: 0x829a, type: TYPES.RATIONAL, count: 1, block: rationals([[1, 250]]) },
  { tag: 0x829d, type: TYPES.RATIONAL, count: 1, block: rationals([[28, 10]]) },
  { tag: 0x8827, type: TYPES.SHORT, count: 1, value: 400 },
  { tag: 0x9003, type: TYPES.ASCII, count: 20, block: ascii('2026:09:01 10:30:00') },
  { tag: 0x920a, type: TYPES.RATIONAL, count: 1, block: rationals([[50, 1]]) },
  { tag: 0xa434, type: TYPES.ASCII, count: 8, block: ascii('TC-Lens') },
]

const ifd0Entries = [
  { tag: 0x010f, type: TYPES.ASCII, count: 8, block: ascii('TestCam') },
  { tag: 0x0110, type: TYPES.ASCII, count: 7, block: ascii('TC-1000') },
]

// 布局: header(8) + IFD0 + ExifIFD + GPSIFD + data
const ifdSize = (list) => 2 + list.length * 12 + 4

// 先加入指针 entry（占位，稍后回填值），保证尺寸计算正确
const exifPointer = { tag: 0x8769, type: TYPES.LONG, count: 1, value: 0 }
const gpsPointer = { tag: 0x8825, type: TYPES.LONG, count: 1, value: 0 }
ifd0Entries.push(exifPointer, gpsPointer)

let offset = 8 + ifdSize(ifd0Entries)
exifPointer.value = offset
offset += ifdSize(exifEntries)
gpsPointer.value = offset
offset += ifdSize(gpsEntries)

// 数据块偏移分配
const dataArea = []
for (const e of [...ifd0Entries, ...exifEntries, ...gpsEntries]) {
  if (e.block) {
    e.blockOffset = offset
    dataArea.push(e.block)
    offset += e.block.length
    if (offset % 2) {
      offset += 1
      dataArea.push(Buffer.from([0]))
    }
  }
}

function buildIfd(list) {
  const parts = []
  const head = Buffer.alloc(2)
  head.writeUInt16BE(list.length)
  parts.push(head)
  for (const e of list) {
    const ent = Buffer.alloc(12)
    ent.writeUInt16BE(e.tag, 0)
    ent.writeUInt16BE(e.type, 2)
    ent.writeUInt32BE(e.count, 4)
    const size = TYPE_SIZES[e.type] * e.count
    if (e.block) {
      ent.writeUInt32BE(e.blockOffset, 8)
    } else if (size <= 4) {
      if (e.type === TYPES.SHORT) ent.writeUInt16BE(e.value, 8)
      else if (e.type === TYPES.LONG) ent.writeUInt32BE(e.value, 8)
      else e.value.copy(ent, 8) // ASCII 内联
    }
    parts.push(ent)
  }
  parts.push(Buffer.alloc(4))
  return Buffer.concat(parts)
}

const tiffHeader = Buffer.alloc(8)
tiffHeader.write('MM', 0, 'ascii')
tiffHeader.writeUInt16BE(0x002a, 2)
tiffHeader.writeUInt32BE(8, 4)

// TIFF 规范要求 entry 按 tag 升序
ifd0Entries.sort((a, b) => a.tag - b.tag)
exifEntries.sort((a, b) => a.tag - b.tag)
gpsEntries.sort((a, b) => a.tag - b.tag)

const tiff = Buffer.concat([
  tiffHeader,
  buildIfd(ifd0Entries),
  buildIfd(exifEntries),
  buildIfd(gpsEntries),
  ...dataArea,
])

const app1Body = Buffer.concat([Buffer.from('Exif\0\0', 'ascii'), tiff])
const len = Buffer.alloc(2)
len.writeUInt16BE(app1Body.length + 2)
const app1 = Buffer.concat([Buffer.from([0xff, 0xe1]), len, app1Body])

const out = Buffer.concat([jpeg.subarray(0, 2), app1, jpeg.subarray(2)])
const dest = process.argv[2] ?? 'test-photo.jpg'
writeFileSync(dest, out)
console.log(`written ${dest} (${out.length} bytes)`)
