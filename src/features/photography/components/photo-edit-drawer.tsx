import * as React from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategoriesQuery, useUpdatePhoto } from '../data/queries'
import { type Photo } from '../data/types'

interface PhotoEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Photo | null
}

interface EditFormValues {
  title: string
  description: string
  category: string
  tags: string
  featured: boolean
}

export function PhotoEditDrawer({
  open,
  onOpenChange,
  currentRow,
}: PhotoEditDrawerProps) {
  const { data: categories = [] } = useCategoriesQuery()
  const updateMutation = useUpdatePhoto()

  const [form, setForm] = React.useState<EditFormValues>({
    title: '',
    description: '',
    category: '',
    tags: '',
    featured: false,
  })

  React.useEffect(() => {
    if (currentRow) {
      setForm({
        title: currentRow.title,
        description: currentRow.description ?? '',
        category: currentRow.category ?? '',
        tags: currentRow.tags.join(', '),
        featured: currentRow.featured,
      })
    }
  }, [currentRow])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentRow) return
    if (!form.title.trim()) return

    await updateMutation.mutateAsync({
      id: currentRow.id,
      input: {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category || null,
        tags: form.tags
          .split(/[,，]/)
          .map((t) => t.trim())
          .filter(Boolean),
        featured: form.featured,
      },
    })
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
      }}
    >
      <SheetContent className='flex flex-col overflow-y-auto sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>编辑作品</SheetTitle>
          <SheetDescription>
            修改作品元数据，R2 原图文件不受影响。
          </SheetDescription>
        </SheetHeader>

        {currentRow && (
          <div className='px-4'>
            <div className='overflow-hidden rounded-md border'>
              <img
                src={currentRow.displayUrl}
                alt={currentRow.title}
                className='max-h-64 w-full object-contain'
              />
            </div>

            {/* 只读 EXIF 摘要 */}
            <dl className='text-muted-foreground mt-3 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-muted/50 p-3 text-xs'>
              <dt className='font-medium text-foreground'>EXIF（只读）</dt>
              <dd />
              <span>
                相机：{currentRow.cameraMake ?? ''}{' '}
                {currentRow.cameraModel ?? '-'}
              </span>
              <span>镜头：{currentRow.lensModel ?? '-'}</span>
              <span>ISO：{currentRow.iso ?? '-'}</span>
              <span>光圈：f/{currentRow.aperture ?? '-'}</span>
              <span>快门：{currentRow.shutterSpeed ?? '-'}</span>
              <span>
                焦距：
                {currentRow.focalLength ? `${currentRow.focalLength}mm` : '-'}
              </span>
              <span>
                尺寸：{currentRow.width ?? '-'} × {currentRow.height ?? '-'}
              </span>
              <span>
                拍摄时间：
                {currentRow.dateTaken
                  ? new Date(currentRow.dateTaken).toLocaleString('zh-CN')
                  : '-'}
              </span>
            </dl>

            <form
              id='photo-edit-form'
              onSubmit={handleSubmit}
              className='mt-4 space-y-4'
            >
              <div className='space-y-1.5'>
                <FormLabel htmlFor='edit-title'>标题</FormLabel>
                <Input
                  id='edit-title'
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>

              <div className='space-y-1.5'>
                <FormLabel htmlFor='edit-description'>描述</FormLabel>
                <Textarea
                  id='edit-description'
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <FormLabel>分类</FormLabel>
                  <Select
                    value={form.category || 'none'}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        category: v === 'none' ? '' : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择分类' />
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
                  <FormLabel htmlFor='edit-tags'>标签</FormLabel>
                  <Input
                    id='edit-tags'
                    value={form.tags}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tags: e.target.value }))
                    }
                    placeholder='逗号分隔'
                  />
                </div>
              </div>

              <div className='flex items-center justify-between rounded-md border p-3'>
                <div>
                  <FormLabel htmlFor='edit-featured'>精选作品</FormLabel>
                  <p className='text-muted-foreground text-xs'>
                    展示在首页精选区
                  </p>
                </div>
                <Switch
                  id='edit-featured'
                  checked={form.featured}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, featured: checked }))
                  }
                />
              </div>

              <SheetFooter className='mt-6'>
                <Button
                  variant='outline'
                  type='button'
                  onClick={() => onOpenChange(false)}
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
                  保存
                </Button>
              </SheetFooter>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
