import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeletePhoto } from '../data/queries'
import { type Photo } from '../data/types'

interface PhotoBulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRows: Photo[]
}

export function PhotoBulkDeleteDialog({
  open,
  onOpenChange,
  selectedRows,
}: PhotoBulkDeleteDialogProps) {
  const deleteMutation = useDeletePhoto()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (selectedRows.length === 0) return
    setDeleting(true)
    let success = 0
    for (const row of selectedRows) {
      const ok = await deleteMutation
        .mutateAsync(row.id)
        .then(() => true)
        .catch(() => false)
      if (!ok) break
      success++
    }
    setDeleting(false)
    // 仅在至少删除成功一条时关闭对话框；缓存失效由 useDeletePhoto.onSuccess 触发刷新
    if (success > 0) onOpenChange(false)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!deleting) onOpenChange(v)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认批量删除作品？</AlertDialogTitle>
          <AlertDialogDescription>
            将删除选中的 {selectedRows.length} 个作品的数据库记录，并同步删除
            R2 中的原图文件。此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              void handleDelete()
            }}
            disabled={deleting}
            className='bg-destructive hover:bg-destructive/90 text-white'
          >
            {deleting ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Trash2 className='size-4' />
            )}
            删除 {selectedRows.length} 个作品
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
