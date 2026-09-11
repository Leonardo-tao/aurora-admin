import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import { photoKeys } from './data/queries'
import { PhotoBulkDeleteDialog } from './components/photo-bulk-delete-dialog'
import { PhotoDeleteDialog } from './components/photo-delete-dialog'
import { PhotoUploadDialog } from './components/photo-upload-dialog'
import { PhotosProvider, usePhotos } from './components/photos-provider'
import { PhotosTable } from './components/photos-table'

export function Photography() {
  return (
    <PhotosProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
        </div>
      </Header>

      <Main fixed fluid className='gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>摄影作品</h2>
          </div>
          <PhotosPrimaryButtons />
        </div>
        <PhotosTable />
      </Main>

      <PhotosDialogs />
    </PhotosProvider>
  )
}

function PhotosPrimaryButtons() {
  const { setOpen } = usePhotos()
  const queryClient = useQueryClient()
  const isFetching = useIsFetching({ queryKey: photoKeys.all })
  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='icon'
        aria-label='刷新'
        title='刷新列表'
        onClick={() =>
          void queryClient.invalidateQueries({ queryKey: photoKeys.all })
        }
      >
        <RefreshCw className={cn('size-4', isFetching > 0 && 'animate-spin')} />
      </Button>
      <Button onClick={() => setOpen('upload')}>
        <Upload className='size-4' />
        上传作品
      </Button>
    </div>
  )
}

function PhotosDialogs() {
  const {
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    selectedRows,
    setSelectedRows,
  } = usePhotos()
  return (
    <>
      <PhotoUploadDialog
        open={open === 'upload'}
        onOpenChange={(v) => setOpen(v ? 'upload' : null)}
      />
      <PhotoDeleteDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          setOpen(v ? 'delete' : null)
          if (!v) setCurrentRow(null)
        }}
        currentRow={currentRow}
      />
      <PhotoBulkDeleteDialog
        open={open === 'bulk-delete'}
        onOpenChange={(v) => {
          setOpen(v ? 'bulk-delete' : null)
          if (!v) setSelectedRows([])
        }}
        selectedRows={selectedRows}
      />
    </>
  )
}
