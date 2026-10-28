export function Sparkline({ series }: { series: Array<{ date: string; kobo: number }> }) {
  const values = series.map((item) => Math.max(0, item.kobo))
  const maximum = Math.max(...values, 1)
  const points = values
    .map(
      (value, index) =>
        `${values.length < 2 ? 0 : index * (320 / (values.length - 1))},${78 - (value / maximum) * 68}`,
    )
    .join(' ')
  const total = series.reduce((sum, item) => sum + item.kobo, 0)
  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Earnings, last 30 days</p>
          <p className="mt-1 text-2xl font-bold text-ink">
            ₦{Math.round(total / 100).toLocaleString('en-NG')}
          </p>
        </div>
        <p className="text-xs text-muted">
          {series[0]?.date} – {series.at(-1)?.date}
        </p>
      </div>
      <svg
        role="img"
        aria-label="Earnings chart for the last 30 days"
        viewBox="0 0 320 88"
        className="h-28 w-full overflow-visible"
      >
        <defs>
          <linearGradient id="earnings-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity=".18" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,88 ${points} 320,88`} fill="url(#earnings-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#1e3a8a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
    </div>
  )
}
