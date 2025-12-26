'use client'

import QuantitySelector from '@/lib/components/QuantitySelector'
import { CartLine } from '@/lib/shopify/types'

export default function CartItemRow({
  line,
  onQuantityChange,
  onRemove,
}: {
  line: CartLine
  onQuantityChange: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p>{line.merchandise.product.title}</p>
      <p>{line.merchandise.title}</p>

      <QuantitySelector
        value={line.quantity}
        onChange={(q) => onQuantityChange(line.id, q)}
      />

      <button onClick={() => onRemove(line.id)}>
        削除
      </button>
    </div>
  )
}
