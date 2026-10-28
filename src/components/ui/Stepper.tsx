export function Stepper({
  labels,
  current,
  offset = 0,
}: {
  labels: string[]
  current: number
  offset?: number
}) {
  return (
    <ol aria-label="Application progress" className="grid grid-cols-4 gap-2">
      {labels.map((label, index) => {
        const active = index + 1 === current
        const complete = index + 1 < current
        return (
          <li key={label} aria-current={active ? 'step' : undefined} className="min-w-0">
            <div
              className={`h-1.5 rounded-full ${active || complete ? 'bg-primary' : 'bg-line'}`}
            />
            <span
              className={`mt-2 block truncate text-[10px] leading-tight sm:text-xs ${active ? 'font-semibold text-primary' : 'text-muted'}`}
            >
              {index + 1 + offset} · {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
