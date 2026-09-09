import { type ColumnDef } from '@tanstack/react-table'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Download } from 'lucide-react'
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
        <a
          href={row.original.displayUrl}
          target='_blank'
          rel='noreferrer'
          className='block h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted'
        >
          <img
            src={row.original.thumbUrl}
            alt={row.original.title}
            loading='lazy'
            className='h-full w-full object-cover transition-opacity'
          />
        </a>
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
      accessorKey: 'cameraModel',
      header: '相机',
      cell: ({ row }) => (
        <span className='text-muted-foreground max-w-36 truncate text-sm'>
          {row.original.cameraModel ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'dateTaken',
      header: '拍摄时间',
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {row.original.dateTaken
            ? new Date(row.original.dateTaken).toLocaleDateString('zh-CN')
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'fileSize',
      header: '大小',
      cell: ({ row }) => (
        <span className='text-muted-foreground text-sm'>
          {formatBytes(row.original.fileSize)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
            >
              <MoreHorizontal className='size-4' />
              <span className='sr-only'>打开菜单</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className='size-4' />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={row.original.downloadUrl} download>
                <Download className='size-4' />
                下载原图（保留 EXIF）
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className='size-4' />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
