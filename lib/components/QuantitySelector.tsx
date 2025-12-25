'use client'

type Props = {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export default function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
}: Props) {
  const decrement = () => {
    const next = Math.max(min, value - 1)
    onChange(next)
  }

  const increment = () => {
    const next = max ? Math.min(max, value + 1) : value + 1
    onChange(next)
  }

  return (
    <div style={{ margin: '16px 0' }}>
      <p>数量</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={decrement} disabled={value <= min}>
          −
        </button>

        <span style={{ minWidth: 24, textAlign: 'center' }}>
          {value}
        </span>

        <button onClick={increment} disabled={max !== undefined && value >= max}>
          ＋
        </button>
      </div>
    </div>
  )
}
