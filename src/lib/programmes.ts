import { serverBackendFetch } from '@/lib/backend-api'

export interface ProgrammeOption {
  slug: string
  title: string
  shortDescription: string
  schools: string[]
}

export interface ProgrammeCatalogue {
  programmes: ProgrammeOption[]
  unavailable: boolean
}

type JsonRecord = Record<string, unknown>

function record(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function mapProgramme(value: unknown): ProgrammeOption | null {
  const item = record(value)
  const slug = text(item.slug)
  const title = text(item.title)
  if (item.status !== 'published' || item.isBonus === true || !slug || !title) return null

  const schools = Array.isArray(item.categories)
    ? item.categories
        .map((category) => text(record(category).name))
        .filter(Boolean)
    : []

  return {
    slug,
    title,
    shortDescription: text(item.shortDescription),
    schools: [...new Set(schools)],
  }
}

/**
 * Read only the public, published programme catalogue. Keep Payload documents on the server and
 * pass a small, explicit shape to the client link builder.
 */
export async function loadPromotableProgrammes(): Promise<ProgrammeCatalogue> {
  const params = new URLSearchParams({
    depth: '1',
    limit: '100',
    sort: 'title',
    'where[status][equals]': 'published',
  })

  try {
    const response = await serverBackendFetch('courses?' + params.toString())
    if (!response.ok) return { programmes: [], unavailable: true }

    const payload: unknown = await response.json().catch(() => null)
    const docs = record(payload).docs
    if (!Array.isArray(docs)) return { programmes: [], unavailable: true }

    const programmes = docs
      .map(mapProgramme)
      .filter((programme): programme is ProgrammeOption => programme !== null)
      .sort((a, b) => a.title.localeCompare(b.title, 'en-NG'))

    return { programmes, unavailable: false }
  } catch {
    return { programmes: [], unavailable: true }
  }
}
