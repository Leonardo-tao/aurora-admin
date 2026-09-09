import { Link } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { usePhotosQuery } from '@/features/photography/data/queries'

/** 最新上传的作品缩略图（Transformations webp） */
export function RecentPhotos() {
  const { data, isLoading } = usePhotosQuery({ limit: 8 })

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='aspect-square rounded-md' />
        ))}
      </div>
    )
  }

  const photos = data?.data ?? []

  if (!photos.length) {
    return (
      <p className='text-muted-foreground text-sm'>
        暂无作品，前往
        <Link to='/photos' className='text-foreground underline-offset-4 hover:underline'>
          摄影作品
        </Link>
        上传第一张照片。
      </p>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
      {photos.map((photo) => (
        <a
          key={photo.id}
          href={photo.displayUrl}
          target='_blank'
          rel='noreferrer'
          title={photo.title}
          className='group relative block aspect-square overflow-hidden rounded-md bg-muted'
        >
          <img
            src={photo.thumbUrl}
            alt={photo.title}
            loading='lazy'
            className='h-full w-full object-cover transition-transform group-hover:scale-105'
          />
          <span className='bg-foreground/60 absolute inset-x-0 bottom-0 truncate px-1.5 py-0.5 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100'>
            {photo.title}
          </span>
        </a>
      ))}
    </div>
  )
}
