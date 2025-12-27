'use client'

import QuantitySelector from '@/lib/components/QuantitySelector'
import { CartLine } from '@/lib/shopify/types'

export default function CartItemRow({
  line,
  onQuantityChange,
  onRemove,
  disabled,
}: {
  line: CartLine
  onQuantityChange: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
  disabled?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p>{line.merchandise.product.title}</p>
      <p>{line.merchandise.title}</p>

      <QuantitySelector
        value={line.quantity}
        onChange={(q) => onQuantityChange(line.id, q)}
        disabled={disabled}
      />

      <button onClick={() => onRemove(line.id)} disabled={disabled}>
        削除
      </button>
    </div>
  )
}
