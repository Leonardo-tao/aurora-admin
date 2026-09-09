import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Photography } from '@/features/photography'

const photosSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(20),
  filter: z.string().optional().catch(''),
  category: z.string().optional().catch(''),
  tag: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/photos/')({
  validateSearch: photosSearchSchema,
  component: Photography,
})
