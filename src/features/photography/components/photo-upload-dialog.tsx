import * as React from 'react'
import exifr from 'exifr'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useCategoriesQuery } from '../data/queries'
import { uploadPhoto } from '../data/queries'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type PhotoInput } from '../data/types'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** 快门速度显示：0.004 → 1/250 */
function formatShutter(exposureTime?: number): string | null {
  if (!exposureTime) return null
  if (exposureTime >= 1) return `${exposureTime}s`
  return `1/${Math.round(1 / exposureTime)}`
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
}: UploadDialogProps) {
  const { data: categories = [] } = useCategoriesQuery()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [parsing, setParsing] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  const [form, setForm] = React.useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    featured: false,
  })
  const [exifMeta, setExifMeta] = React.useState<PhotoInput | null>(null)

  const reset = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setExifMeta(null)
    setForm({ title: '', description: '', category: '', tags: '', featured: false })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      toast.error('请选择图片文件（JPEG 原图可保留完整 EXIF）')
      return
    }
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    // 标题默认取文件名（去扩展名）
    setForm((f) => ({
      ...f,
      title: f.title || selected.name.replace(/\.[^.]+$/, ''),
    }))

    // 解析 EXIF（失败不阻塞上传，仅无元数据）
    setParsing(true)
    try {
      const exif = (await exifr.parse(selected, {
        tiff: true,
        exif: true,
        gps: true,
      })) as Record<string, unknown> | undefined

      if (exif) {
        setExifMeta({
          cameraMake: (exif.Make as string) ?? null,
          cameraModel: (exif.Model as string) ?? null,
          lensMake: (exif.LensMake as string) ?? null,
          lensModel:
            (exif.LensModel as string) ??
            (exif.LensSpecification as string)?.toString?.() ??
            null,
          iso: (exif.ISO as number) ?? null,
          aperture: (exif.FNumber as number) ?? null,
          shutterSpeed: formatShutter(exif.ExposureTime as number),
          focalLength: (exif.FocalLength as number) ?? null,
          gpsLatitude: (exif.latitude as number) ?? null,
          gpsLongitude: (exif.longitude as number) ?? null,
          dateTaken: exif.DateTimeOriginal
            ? new Date(exif.DateTimeOriginal as Date).toISOString()
            : null,
          width: (exif.ExifImageWidth as number) ??
            (exif.ImageWidth as number) ??
            null,
          height: (exif.ExifImageHeight as number) ??
            (exif.ImageHeight as number) ??
            null,
          fileSize: selected.size,
          mimeType: selected.type || 'image/jpeg',
        })
      } else {
        setExifMeta({ fileSize: selected.size, mimeType: selected.type })
      }
    } catch {
      toast.info('未解析到 EXIF 元数据（可能是非 JPEG 或无 EXIF 图片）')
      setExifMeta({ fileSize: selected.size, mimeType: selected.type })
    } finally {
      setParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('请先选择图片')
      return
    }
    if (!form.title.trim()) {
      toast.error('请填写标题')
      return
    }

    setUploading(true)
    try {
      await uploadPhoto(file, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        tags: form.tags
          .split(/[,，]/)
          .map((t) => t.trim())
          .filter(Boolean),
        featured: form.featured,
        ...exifMeta,
      })
      toast.success('上传成功，原图已存入 R2（EXIF 完整保留）')
      onOpenChange(false)
      reset()
    } catch (error) {
      toast.error(`上传失败：${(error as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>上传作品</DialogTitle>
          <DialogDescription>
            选择 JPEG 原图，EXIF 将自动解析；原图直传 R2，完整保留元数据。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* 文件选择 */}
          <div>
            <Label htmlFor='photo-file'>图片文件</Label>
            <input
              ref={fileInputRef}
              id='photo-file'
              type='file'
              accept='image/jpeg,image/jpg,image/png,image/webp,image/avif'
              onChange={handleFileChange}
              className='file:border-input file:bg-input file:text-foreground mt-1.5 flex w-full cursor-pointer rounded-md border border-dashed p-1 text-sm file:h-8 file:cursor-pointer file:rounded file:border-0 file:px-3 file:text-sm'
            />
            {parsing && (
              <p className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                <Loader2 className='size-3 animate-spin' />
                正在解析 EXIF...
              </p>
            )}
          </div>

          {/* 预览 */}
          {previewUrl && (
            <div className='overflow-hidden rounded-md border'>
              <img
                src={previewUrl}
                alt='预览'
                className='max-h-52 w-full object-contain'
              />
            </div>
          )}

          {/* EXIF 摘要 */}
          {exifMeta && (
            <div className='text-muted-foreground rounded-md bg-muted/50 p-3 text-xs'>
              <p className='mb-1 font-medium text-foreground'>
                EXIF 元数据（将随作品保存）
              </p>
              <div className='grid grid-cols-2 gap-x-4 gap-y-0.5'>
                <span>
                  相机：{exifMeta.cameraMake ?? ''} {exifMeta.cameraModel ?? '-'}
                </span>
                <span>镜头：{exifMeta.lensModel ?? '-'}</span>
                <span>ISO：{exifMeta.iso ?? '-'}</span>
                <span>光圈：f/{exifMeta.aperture ?? '-'}</span>
                <span>快门：{exifMeta.shutterSpeed ?? '-'}</span>
                <span>焦距：{exifMeta.focalLength ? `${exifMeta.focalLength}mm` : '-'}</span>
                <span>
                  尺寸：{exifMeta.width ?? '-'} × {exifMeta.height ?? '-'}
                </span>
                <span>
                  拍摄时间：
                  {exifMeta.dateTaken
                    ? new Date(exifMeta.dateTaken).toLocaleString('zh-CN')
                    : '-'}
                </span>
                {exifMeta.gpsLatitude != null && (
                  <span className='col-span-2'>
                    GPS：{exifMeta.gpsLatitude.toFixed(5)},{' '}
                    {exifMeta.gpsLongitude?.toFixed(5)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 表单 */}
          <div className='space-y-1.5'>
            <Label htmlFor='photo-title'>标题 *</Label>
            <Input
              id='photo-title'
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder='作品标题'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='photo-description'>描述</Label>
            <Textarea
              id='photo-description'
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder='作品描述（可选）'
              rows={2}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>分类</Label>
              <Select
                value={form.category || 'none'}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v === 'none' ? '' : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择或留空' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>未分类</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='photo-tags'>标签</Label>
              <Input
                id='photo-tags'
                value={form.tags}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder='逗号分隔，如：街拍, 日落'
              />
            </div>
          </div>

          <div className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <Label htmlFor='photo-featured'>精选作品</Label>
              <p className='text-muted-foreground text-xs'>
                精选作品会展示在首页精选区
              </p>
            </div>
            <Switch
              id='photo-featured'
              checked={form.featured}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, featured: checked }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              取消
            </Button>
            <Button type='submit' disabled={!file || parsing || uploading}>
              {uploading ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className='size-4' />
                  上传
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
