import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { promotionAssetGroups, type PromotionAsset } from '@/lib/promotion-assets'

export const metadata: Metadata = { title: 'Promotion assets' }

function AssetCard({ asset }: { asset: PromotionAsset }) {
  const placement = asset.format === 'Story' ? 'Instagram Stories and WhatsApp Status' : 'Instagram and Facebook feeds'

  return (
    <Card className="overflow-hidden">
      <div className="flex h-72 items-center justify-center bg-navy-900 p-2">
        <Image
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes="(max-width: 640px) 88vw, (max-width: 1280px) 42vw, 28vw"
          className="h-full w-auto max-w-full object-contain"
        />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink">{asset.title}</h3>
            <p className="mt-1 text-sm text-muted">{asset.width} × {asset.height} px · PNG</p>
          </div>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary">
            {asset.format}
          </span>
        </div>
        <p className="text-sm text-muted">Suitable for {placement}.</p>
        <a
          href={asset.src}
          download={asset.filename}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Download aria-hidden="true" className="size-4" />
          Download {asset.format.toLowerCase()} image
        </a>
      </div>
    </Card>
  )
}

export default function PromotionAssetsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-text">Help more people find SkillsAir</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
            Promotion assets
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Download ready-made Feed and Story creatives for general promotion, Cyber Security and Data Analysis.
          </p>
        </div>
        <Link
          href="/dashboard/links"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl border border-line bg-white px-4 text-sm font-semibold text-primary hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:self-auto"
        >
          Create a tracked link
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <p role="note" className="rounded-xl border border-pending-text/30 bg-pending-bg px-4 py-3 text-sm leading-6 text-pending-chip-text">
        These creatives say “Apply by 31 October”. Confirm that the application deadline is still current before sharing.
      </p>

      {promotionAssetGroups.map((group) => (
        <section key={group.id} aria-labelledby={`assets-${group.id}`} className="space-y-4">
          <div>
            <h2 id={`assets-${group.id}`} className="font-heading text-xl font-bold text-navy-900">
              {group.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{group.description}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {group.assets.map((asset) => <AssetCard key={asset.filename} asset={asset} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
