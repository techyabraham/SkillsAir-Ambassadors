import { notFound } from 'next/navigation'
import { ComponentGallery } from '@/components/portal/ComponentGallery'

export default function ComponentsPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <ComponentGallery />
}
