import { createFileRoute } from '@tanstack/react-router'
import { PhotoEdit } from '@/features/photography/edit'

export const Route = createFileRoute('/_authenticated/photos/$photoId/edit')({
  component: PhotoEdit,
})
