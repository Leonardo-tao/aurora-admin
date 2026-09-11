import * as React from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useCategoriesQuery,
  usePhotoQuery,
  useTagsQuery,
  useUpdatePhoto,
} from './data/queries'
import { CategorySelect } from './components/category-select'
import { TagInput } from './components/tag-input'
import type { Photo, PhotoInput } from './data/types'

const route = getRouteApi('/_authenticated/photos/$photoId/edit')

interface EditFormValues {
  title: string
  description: string
  category: string
  tags: string[]
  featured: boolean
  cameraMake: string
  cameraModel: string
  lensMake: string
  lensModel: string
  iso: string
  aperture: string
  shutterSpeed: string
  focalLength: string
  gpsLatitude: string
  gpsLongitude: string
  gpsLocation: string
  dateTaken: string
  width: string
  height: string
}

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIsoOrNull(local: string): string | null {
  if (!local) return null
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function numOrNull(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function photoToForm(photo: Photo): EditFormValues {
  return {
    title: photo.title,
    description: photo.description ?? '',
    category: photo.category ?? '',
    tags: [...photo.tags],
    featured: photo.featured,
    cameraMake: photo.exif.cameraMake ?? '',
    cameraModel: photo.exif.cameraModel ?? '',
    lensMake: photo.exif.lensMake ?? '',
    lensModel: photo.exif.lensModel ?? '',
    iso: photo.exif.iso != null ? String(photo.exif.iso) : '',
    aperture: photo.exif.aperture != null ? String(photo.exif.aperture) : '',
    shutterSpeed: photo.exif.shutterSpeed ?? '',
    focalLength:
      photo.exif.focalLength != null ? String(photo.exif.focalLength) : '',
    gpsLatitude:
      photo.exif.gpsLatitude != null ? String(photo.exif.gpsLatitude) : '',
    gpsLongitude:
      photo.exif.gpsLongitude != null ? String(photo.exif.gpsLongitude) : '',
    gpsLocation: photo.exif.gpsLocation ?? '',
    dateTaken: toLocalInput(photo.exif.dateTaken),
    width: photo.exif.width != null ? String(photo.exif.width) : '',
    height: photo.exif.height != null ? String(photo.exif.height) : '',
  }
}

export function PhotoEdit() {
  const { photoId } = route.useParams()
  const navigate = useNavigate()
  const { data: photo, isLoading, isError, error } = usePhotoQuery(photoId)

  const goBack = React.useCallback(
    () => void navigate({ to: '/photos' }),
    [navigate]
  )

  return (
    <>
      <Header fixed>
        <Button
          variant='ghost'
          size='icon'
          aria-label='返回作品列表'
          title='返回作品列表'
          onClick={goBack}
        >
          <ArrowLeft className='size-4' />
        </Button>
        <span className='text-sm font-medium'>编辑作品</span>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main className='space-y-4 sm:space-y-6'>
        {isLoading && (
          <div className='grid gap-4 lg:grid-cols-12'>
            <Skeleton className='h-96 lg:col-span-5' />
            <Skeleton className='h-96 lg:col-span-7' />
          </div>
        )}

        {isError && (
          <Card>
            <CardHeader>
              <CardTitle>加载失败</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : '无法获取作品详情'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant='outline' onClick={goBack}>
                <ArrowLeft className='size-4' />
                返回作品列表
              </Button>
            </CardContent>
          </Card>
        )}

        {photo && !isLoading && (
          <PhotoEditForm key={photo.id} photo={photo} onSaved={goBack} />
        )}
      </Main>
    </>
  )
}

function PhotoEditForm({
  photo,
  onSaved,
}: {
  photo: Photo
  onSaved: () => void
}) {
  const { data: categories = [] } = useCategoriesQuery()
  const { data: allTags = [] } = useTagsQuery()
  const updateMutation = useUpdatePhoto()
  const [form, setForm] = React.useState<EditFormValues>(() =>
    photoToForm(photo)
  )

  const set = <K extends keyof EditFormValues>(
    key: K,
    value: EditFormValues[K]
  ) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const input: PhotoInput = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category || null,
      tags: form.tags.map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      cameraMake: form.cameraMake.trim() || null,
      cameraModel: form.cameraModel.trim() || null,
      lensMake: form.lensMake.trim() || null,
      lensModel: form.lensModel.trim() || null,
      iso: numOrNull(form.iso),
      aperture: numOrNull(form.aperture),
      shutterSpeed: form.shutterSpeed.trim() || null,
      focalLength: numOrNull(form.focalLength),
      gpsLatitude: numOrNull(form.gpsLatitude),
      gpsLongitude: numOrNull(form.gpsLongitude),
      gpsLocation: form.gpsLocation.trim() || null,
      dateTaken: toIsoOrNull(form.dateTaken),
      width: numOrNull(form.width),
      height: numOrNull(form.height),
    }
    const ok = await updateMutation
      .mutateAsync({ id: photo.id, input })
      .then(() => true)
      .catch(() => false)
    if (ok) onSaved()
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className='grid items-start gap-4 lg:grid-cols-12'
    >
      <div className='space-y-4 lg:col-span-5'>
        <Card>
          <CardHeader>
            <CardTitle>图片预览</CardTitle>
            <CardDescription>R2 原图不受元数据编辑影响</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='bg-muted/40 overflow-hidden rounded-md border'>
              <img
                src={photo.urls.display}
                alt={photo.title}
                className='max-h-[420px] w-full object-contain'
              />
            </div>
            <dl className='text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs'>
              <dt className='text-foreground font-medium'>Slug</dt>
              <dd className='truncate' title={photo.slug}>
                {photo.slug}
              </dd>
              <dt className='text-foreground font-medium'>尺寸</dt>
              <dd>
                {photo.exif.width ?? '-'} × {photo.exif.height ?? '-'}
              </dd>
              <dt className='text-foreground font-medium'>文件大小</dt>
              <dd>{formatBytes(photo.file.size)}</dd>
              <dt className='text-foreground font-medium'>MIME</dt>
              <dd>{photo.file.mimeType ?? '-'}</dd>
              <dt className='text-foreground font-medium'>浏览</dt>
              <dd>{photo.views}</dd>
              <dt className='text-foreground font-medium'>喜欢</dt>
              <dd>{photo.likes}</dd>
              <dt className='text-foreground font-medium'>下载</dt>
              <dd>{photo.downloads}</dd>
              <dt className='text-foreground font-medium'>上传时间</dt>
              <dd>{new Date(photo.createdAt).toLocaleString('zh-CN')}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-4 lg:col-span-7'>
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>标题、描述、分类与标签</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-title'>标题</Label>
              <Input
                id='edit-title'
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='edit-description'>描述</Label>
              <Textarea
                id='edit-description'
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label>分类</Label>
                <CategorySelect
                  value={form.category}
                  onChange={(v) => set('category', v)}
                  categories={categories}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-tags'>标签</Label>
                <TagInput
                  id='edit-tags'
                  value={form.tags}
                  onChange={(tags) => set('tags', tags)}
                  suggestions={allTags.map((t) => t.name)}
                />
              </div>
            </div>

            <div className='flex items-center justify-between rounded-md border p-3'>
              <div>
                <Label htmlFor='edit-featured'>精选作品</Label>
                <p className='text-muted-foreground text-xs'>
                  展示在首页精选区
                </p>
              </div>
              <Switch
                id='edit-featured'
                checked={form.featured}
                onCheckedChange={(checked) => set('featured', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>拍摄参数（EXIF）</CardTitle>
            <CardDescription>可修正自动解析出的 EXIF 信息</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-camera-make'>相机品牌</Label>
                <Input
                  id='edit-camera-make'
                  value={form.cameraMake}
                  onChange={(e) => set('cameraMake', e.target.value)}
                  placeholder='如：Sony'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-camera-model'>相机型号</Label>
                <Input
                  id='edit-camera-model'
                  value={form.cameraModel}
                  onChange={(e) => set('cameraModel', e.target.value)}
                  placeholder='如：ILCE-7M4'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-lens-make'>镜头品牌</Label>
                <Input
                  id='edit-lens-make'
                  value={form.lensMake}
                  onChange={(e) => set('lensMake', e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-lens-model'>镜头型号</Label>
                <Input
                  id='edit-lens-model'
                  value={form.lensModel}
                  onChange={(e) => set('lensModel', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-iso'>ISO</Label>
                <Input
                  id='edit-iso'
                  type='number'
                  value={form.iso}
                  onChange={(e) => set('iso', e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-aperture'>光圈</Label>
                <Input
                  id='edit-aperture'
                  type='number'
                  step='0.1'
                  value={form.aperture}
                  onChange={(e) => set('aperture', e.target.value)}
                  placeholder='如：2.8'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-shutter'>快门速度</Label>
                <Input
                  id='edit-shutter'
                  value={form.shutterSpeed}
                  onChange={(e) => set('shutterSpeed', e.target.value)}
                  placeholder='如：1/250'
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-focal'>焦距 (mm)</Label>
                <Input
                  id='edit-focal'
                  type='number'
                  step='0.1'
                  value={form.focalLength}
                  onChange={(e) => set('focalLength', e.target.value)}
                />
              </div>
              <div className='space-y-1.5 sm:col-span-2'>
                <Label htmlFor='edit-date-taken'>拍摄时间</Label>
                <Input
                  id='edit-date-taken'
                  type='datetime-local'
                  value={form.dateTaken}
                  onChange={(e) => set('dateTaken', e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-width'>宽度 (px)</Label>
                <Input
                  id='edit-width'
                  type='number'
                  value={form.width}
                  onChange={(e) => set('width', e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-height'>高度 (px)</Label>
                <Input
                  id='edit-height'
                  type='number'
                  value={form.height}
                  onChange={(e) => set('height', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>位置信息（GPS）</CardTitle>
            <CardDescription>拍摄地点与经纬度</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-gps-location'>地点名称</Label>
              <Input
                id='edit-gps-location'
                value={form.gpsLocation}
                onChange={(e) => set('gpsLocation', e.target.value)}
                placeholder='如：杭州西湖'
              />
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-gps-lat'>纬度</Label>
                <Input
                  id='edit-gps-lat'
                  type='number'
                  step='any'
                  value={form.gpsLatitude}
                  onChange={(e) => set('gpsLatitude', e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='edit-gps-lng'>经度</Label>
                <Input
                  id='edit-gps-lng'
                  type='number'
                  step='any'
                  value={form.gpsLongitude}
                  onChange={(e) => set('gpsLongitude', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex items-center justify-end gap-2'>
          <Button
            variant='outline'
            type='button'
            onClick={onSaved}
            disabled={updateMutation.isPending}
          >
            取消
          </Button>
          <Button
            type='submit'
            disabled={updateMutation.isPending || !form.title.trim()}
          >
            {updateMutation.isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Save className='size-4' />
            )}
            保存修改
          </Button>
        </div>
      </div>
    </form>
  )
}
