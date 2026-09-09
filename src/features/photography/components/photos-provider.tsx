import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Photo } from '../data/types'

type PhotosDialogType = 'upload' | 'update' | 'delete'

type PhotosContextType = {
  open: PhotosDialogType | null
  setOpen: (str: PhotosDialogType | null) => void
  currentRow: Photo | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Photo | null>>
}

const PhotosContext = React.createContext<PhotosContextType | null>(null)

export function PhotosProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PhotosDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Photo | null>(null)

  return (
    <PhotosContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PhotosContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePhotos = () => {
  const photosContext = React.useContext(PhotosContext)

  if (!photosContext) {
    throw new Error('usePhotos has to be used within <PhotosProvider>')
  }

  return photosContext
}
