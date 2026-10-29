import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import type { PromotionAssetGroup } from '@/lib/promotion-assets'

export function ProgrammeAssetDownloads({ group }: { group: PromotionAssetGroup }) {
  return (
    <div className="space-y-3 border-t border-primary/20 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-navy-900">Promotion assets for this programme</h4>
          <p className="mt-1 text-sm text-muted">
            {group.title} Feed and Story creatives. Share them with the tracked link above.
          </p>
        </div>
        <Link
          href="/dashboard/assets"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary underline"
        >
          All assets
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {group.assets.map((asset) => (
          <div key={asset.filename} className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-white p-3">
            <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy-900 p-1">
              <Image
                src={asset.src}
                alt={asset.alt}
                width={asset.width}
                height={asset.height}
                className="max-h-full w-auto max-w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{asset.format} image</p>
              <p className="mt-1 text-xs text-muted">{asset.width} × {asset.height} px</p>
              <a
                href={asset.src}
                download={asset.filename}
                className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Download aria-hidden="true" className="size-4" />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
