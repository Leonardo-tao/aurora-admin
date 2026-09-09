/**
 * 生成一张 800x600 渐变+噪声 PNG（用于验证 next/image 优化器 webp 转换）。
 * 用法: node scripts/make-test-png.mjs <输出路径>
 */
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const W = 800
const H = 600
const raw = Buffer.alloc(H * (1 + W * 3)) // 每行 filter byte + RGB

for (let y = 0; y < H; y++) {
  const row = y * (1 + W * 3)
  raw[row] = 0 // filter: none
  for (let x = 0; x < W; x++) {
    const i = row + 1 + x * 3
    raw[i] = (x * 255 / W) | 0                      // R: 水平渐变
    raw[i + 1] = (y * 255 / H) | 0                  // G: 垂直渐变
    raw[i + 2] = ((x + y) % 256) ^ ((x * y) % 97)   // B: 噪声条纹
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length)
  return out
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 2 // color type: truecolor

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 6 })),
  chunk('IEND', Buffer.alloc(0)),
])

writeFileSync(process.argv[2] ?? 'test-photo-large.png', png)
console.log(`written ${process.argv[2] ?? 'test-photo-large.png'} (${png.length} bytes)`)
