import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageOff, Star, Pencil, Trash2, Download } from 'lucide-react'
import { API_BASE } from '@/lib/api'
import { type Photo } from '../data/types'

function formatBytes(bytes: number | null): string {
  if (!bytes) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

interface ColumnsOptions {
  onEdit: (photo: Photo) => void
  onDelete: (photo: Photo) => void
}

export function getPhotosColumns({
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<Photo>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='全选'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='选择行'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'preview',
      header: '预览',
      cell: ({ row }) => (
        <PreviewThumb
          photo={row.original}
          onEdit={() => onEdit(row.original)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: '标题',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          {row.original.featured && (
            <Star
              className='size-3.5 shrink-0 fill-amber-400 text-amber-400'
              aria-label='精选'
            />
          )}
          <span className='max-w-48 truncate font-medium sm:max-w-72'>
            {row.original.title}
          </span>
        </div>
      ),
      meta: { className: 'ps-1', tdClassName: 'ps-4' },
    },
    {
      accessorKey: 'category',
      header: '分类',
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant='outline'>{row.original.category}</Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        ),
    },
    {
      accessorKey: 'tags',
      header: '标签',
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex max-w-56 flex-wrap gap-1'>
          {row.original.tags.length ? (
            row.original.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant='secondary' className='font-normal'>
                {tag}
              </Badge>
            ))
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
          {row.original.tags.length > 3 && (
            <span className='text-muted-foreground text-xs'>
              +{row.original.tags.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'cameraModel',
      header: '相机',
      cell: ({ row }) => (
        <span className='text-muted-foreground max-w-36 truncate text-sm'>
          {row.original.exif.cameraModel ?? '-'}
        </span>
      ),
    },
    {
      id: 'dateTaken',
      header: '拍摄时间',
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.exif.dateTaken
            ? new Date(row.original.exif.dateTaken).toLocaleDateString('zh-CN')
            : '-'}
        </span>
      ),
    },
    {
      id: 'fileSize',
      header: '大小',
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {formatBytes(row.original.file.size)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '操作',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='size-8'
            title='编辑作品'
            aria-label={`编辑 ${row.original.title}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className='size-4' />
          </Button>
          <Button
            asChild
            variant='ghost'
            size='icon'
            className='size-8'
            title='下载原图'
          >
            <a
              href={`${API_BASE}/api/photos/${row.original.id}/download`}
              download
              aria-label={`下载 ${row.original.title}`}
            >
              <Download className='size-4' />
            </a>
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-destructive hover:text-destructive size-8'
            title='删除作品'
            aria-label={`删除 ${row.original.title}`}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      ),
    },
  ]
}
