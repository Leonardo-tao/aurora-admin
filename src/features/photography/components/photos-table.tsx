import * as React from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  type PaginationState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Search, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import { getPhotosColumns } from './photos-columns'
import { usePhotos } from './photos-provider'
import {
  useCategoriesQuery,
  useDeletePhoto,
  usePhotosQuery,
  useTagsQuery,
} from '../data/queries'
import { type Photo } from '../data/types'

const route = getRouteApi('/_authenticated/photos/')

type SearchParams = {
  page: number
  pageSize: number
  filter: string
  category: string
  tag: string
}

export function PhotosTable() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const { setOpen, setCurrentRow } = usePhotos()
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // 路由 search 为 optional，统一解析出确定值
  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 20
  const filter = search.filter ?? ''
  const category = search.category ?? ''
  const tag = search.tag ?? ''

  // 防抖搜索：本地输入延迟同步到 URL
  const [filterInput, setFilterInput] = React.useState(search.filter)
  const debouncedFilter = useDebounce(filterInput, 400)
  React.useEffect(() => {
    if (debouncedFilter !== search.filter) {
      navigate({ to: '/photos', search: { ...search, filter: debouncedFilter, page: 1 } })
    }
  }, [debouncedFilter]) // eslint-disable-line react-hooks/exhaustive-deps
  // 外部变化（清空按钮）时同步本地输入
  React.useEffect(() => {
    setFilterInput(search.filter)
  }, [search.filter])

  const { data, isLoading, isError, error, refetch } = usePhotosQuery({
    page,
    limit: pageSize,
    filter: filter || undefined,
    category: category || undefined,
    tag: tag || undefined,
  })

  const { data: categories = [] } = useCategoriesQuery()
  const { data: tags = [] } = useTagsQuery()

  const pagination = React.useMemo<PaginationState>(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize]
  )

  const photos = data?.data ?? []
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const onEdit = React.useCallback(
    (photo: Photo) => {
      setCurrentRow(photo)
      setOpen('update')
    },
    [setCurrentRow, setOpen]
  )
  const onDelete = React.useCallback(
    (photo: Photo) => {
      setCurrentRow(photo)
      setOpen('delete')
    },
    [setCurrentRow, setOpen]
  )

  const columns = React.useMemo(
    () => getPhotosColumns({ onEdit, onDelete }),
    [onEdit, onDelete]
  )

  const table = useReactTable({
    data: photos,
    columns,
    state: { rowSelection, pagination },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount,
    rowCount: total,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater
      navigate({
        to: '/photos',
        search: {
          ...search,
          page: next.pageIndex + 1,
          pageSize: next.pageSize,
        },
      })
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const setParam = (patch: Partial<SearchParams>) => {
    navigate({ to: '/photos', search: { ...search, page: 1, ...patch } })
    setRowSelection({})
  }

  const deleteMutation = useDeletePhoto()
  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)
  const onBulkDelete = async () => {
    if (!confirm(`确定删除选中的 ${selectedIds.length} 个作品？R2 文件将同时删除。`)) return
    for (const id of selectedIds) {
      await deleteMutation.mutateAsync(id)
    }
    setRowSelection({})
    void refetch()
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* 工具栏 */}
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute start-2.5 top-2.5 size-4' />
          <Input
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            placeholder='搜索标题或描述...'
            className='h-8 w-44 ps-8'
          />
          {filterInput && (
            <button
              className='text-muted-foreground hover:text-foreground absolute end-2 top-2'
              onClick={() => setFilterInput('')}
            >
              <X className='size-4' />
            </button>
          )}
        </div>
        <Select
          value={category || 'all'}
          onValueChange={(v) =>
            setParam({ category: v === 'all' ? '' : v })
          }
        >
          <SelectTrigger className='h-8 w-32'>
            <SelectValue placeholder='分类' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>全部分类</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name} ({c.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={search.tag || 'all'}
          onValueChange={(v) => setParam({ tag: v === 'all' ? '' : v })}
        >
          <SelectTrigger className='h-8 w-32'>
            <SelectValue placeholder='标签' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>全部标签</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.name} value={t.name}>
                {t.name} ({t.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className='ms-auto flex items-center gap-2'>
          {selectedIds.length > 0 && (
            <Button variant='destructive' size='sm' onClick={onBulkDelete}>
              <Trash2 className='size-4' />
              删除选中 ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* 表格 */}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_col, j) => (
                    <TableCell key={j}>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  加载失败：{error.message}
                  <Button variant='outline' size='sm' className='ms-2' onClick={() => refetch()}>
                    重试
                  </Button>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  暂无作品，点击右上角「上传作品」添加。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div
        className={cn(
          'flex items-center justify-between gap-2 px-2 text-sm',
          'text-muted-foreground'
        )}
      >
        <div>
          共 {total} 个作品
          {selectedIds.length > 0 && `，已选 ${selectedIds.length} 个`}
        </div>
        <div className='flex items-center gap-2'>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => setParam({ pageSize: Number(v) })}
          >
            <SelectTrigger className='h-8 w-[110px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 50].map((s) => (
                <SelectItem key={s} value={`${s}`}>
                  {s} 条/页
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            size='sm'
            disabled={page <= 1}
            onClick={() =>
              navigate({ to: '/photos', search: { ...search, page: page - 1 } })
            }
          >
            上一页
          </Button>
          <span>
            {page} / {pageCount}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={page >= pageCount}
            onClick={() =>
              navigate({ to: '/photos', search: { ...search, page: page + 1 } })
            }
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}
