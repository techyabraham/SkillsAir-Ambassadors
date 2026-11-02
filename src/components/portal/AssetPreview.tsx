'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { Download, X, ZoomIn } from 'lucide-react'
import type { PromotionAsset } from '@/lib/promotion-assets'
import { cn } from '@/lib/utils'

/**
 * Wraps a creative's thumbnail in a button that opens the full-size image in a modal dialog
 * (native <dialog>: focus trap, Escape to close and focus return come from the browser).
 */
export function AssetPreview({
  asset,
  className,
  compact = false,
  children,
}: {
  asset: PromotionAsset
  className?: string
  /** Small thumbnails show the zoom icon without the word "Preview". */
  compact?: boolean
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Preview ${asset.title} full size`}
        className={cn(
          'group relative cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className,
        )}
      >
        {children}
        <span
          aria-hidden="true"
          className={cn(
            'absolute inline-flex items-center gap-1 rounded-full bg-white/90 text-xs font-semibold text-navy-900 opacity-90 shadow-sm group-hover:opacity-100',
            compact ? 'bottom-1 right-1 p-1' : 'bottom-2 right-2 px-2 py-1',
          )}
        >
          <ZoomIn className="size-3.5" />
          {compact ? null : 'Preview'}
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={asset.title}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}
        className="m-auto max-h-[100dvh] w-auto max-w-[100vw] bg-transparent p-0 backdrop:bg-navy-900/85"
      >
        {open ? (
          <div className="flex max-h-[100dvh] flex-col items-center gap-3 p-3 sm:p-6">
            <div className="flex w-full items-center justify-between gap-3 text-white">
              <p className="min-w-0 truncate text-sm font-semibold">
                {asset.title} · {asset.width} × {asset.height} px
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={asset.src}
                  download={asset.filename}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Download aria-hidden="true" className="size-4" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close preview"
                  className="inline-flex size-11 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>
            <Image
              src={asset.src}
              alt={asset.alt}
              width={asset.width}
              height={asset.height}
              sizes="(max-width: 640px) 95vw, 60vw"
              className="h-auto max-h-[calc(100dvh-6rem)] w-auto max-w-full rounded-lg object-contain"
              priority
            />
          </div>
        ) : null}
      </dialog>
    </>
  )
}
