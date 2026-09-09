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

interface PhotoDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Photo | null
}

export function PhotoDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: PhotoDeleteDialogProps) {
  const deleteMutation = useDeletePhoto()

  const handleDelete = async () => {
    if (!currentRow) return
    await deleteMutation.mutateAsync(currentRow.id)
    onOpenChange(false)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除作品？</AlertDialogTitle>
          <AlertDialogDescription>
            将删除「{currentRow?.title}」的数据库记录，并同步删除 R2
            中的原图文件。此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              void handleDelete()
            }}
            disabled={deleteMutation.isPending}
            className='bg-destructive text-white hover:bg-destructive/90'
          >
            {deleteMutation.isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Trash2 className='size-4' />
            )}
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
