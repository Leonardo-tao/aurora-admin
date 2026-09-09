import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PhotoDeleteDialog } from './components/photo-delete-dialog'
import { PhotoEditDrawer } from './components/photo-edit-drawer'
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
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>摄影作品</h2>
            <p className='text-muted-foreground'>
              管理摄影作品：上传（EXIF 自动解析）、编辑元数据、删除（同步清理
              R2）
            </p>
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
  return (
    <div className='flex items-center gap-2'>
      <Button onClick={() => setOpen('upload')}>
        <Upload className='size-4' />
        上传作品
      </Button>
    </div>
  )
}

function PhotosDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePhotos()
  return (
    <>
      <PhotoUploadDialog
        open={open === 'upload'}
        onOpenChange={(v) => setOpen(v ? 'upload' : null)}
      />
      <PhotoEditDrawer
        open={open === 'update'}
        onOpenChange={(v) => {
          setOpen(v ? 'update' : null)
          if (!v) setCurrentRow(null)
        }}
        currentRow={currentRow}
      />
      <PhotoDeleteDialog
        open={open === 'delete'}
        onOpenChange={(v) => {
          setOpen(v ? 'delete' : null)
          if (!v) setCurrentRow(null)
        }}
        currentRow={currentRow}
      />
    </>
  )
}
