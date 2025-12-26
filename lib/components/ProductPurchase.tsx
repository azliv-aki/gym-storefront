'use client'

import QuantitySelector from './QuantitySelector'
import { VariantSelectionResult } from './VariantSelector'

export default function ProductPurchase({
  selection,
  quantity,
  onQuantityChange,
  onPurchase,
}: {
  selection: VariantSelectionResult
  quantity: number
  onQuantityChange: (value: number) => void
  onPurchase: (payload: {
    variantId: string
    quantity: number
    purchaseState: 'available' | 'preorder'
  }) => void
}) {
  const { variant, isComplete, purchaseState } = selection

  if (!isComplete) {
    return <p>バリエーションを選択してください</p>
  }

  if (purchaseState === 'soldout') {
    return <button disabled>在庫切れ</button>
  }

  if (!variant) return null

  const sellingPlanName = variant.sellingPlanAllocations?.nodes[0]?.sellingPlan?.name ?? null

  return (
    <div>
      <QuantitySelector value={quantity} onChange={onQuantityChange} />

      <button
        onClick={() => {
          onPurchase({
            variantId: variant.id,
            quantity,
            purchaseState,
          })
        }}
      >
        {purchaseState === 'preorder' ? '予約する' : '購入する'}
      </button>

      {purchaseState === 'preorder' && sellingPlanName && (
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>※ {sellingPlanName}</p>
      )}
    </div>
  )
}
