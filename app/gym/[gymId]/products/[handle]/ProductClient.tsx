'use client'

import { useState } from 'react'
import VariantSelector, {
  VariantSelectionResult,
} from '@/lib/components/VariantSelector'
import ProductPurchase from '@/lib/components/ProductPurchase'
import { Variant } from '@/lib/shopify/types'

export default function ProductClient({
  gymId,
  product,
}: {
  gymId: string
  product: Product
}) {
  // ユーザーの商品選択の状態を保持
  const [selection, setSelection] =
    useState<VariantSelectionResult>({
      selectedVariant: null,
      purchaseState: 'incomplete',
    })

  const [quantity, setQuantity] = useState(1)

  return (
    <>
      <VariantSelector
        variants={product.variants}
        value={selection.variant}
        onChange={setSelection}
      />

      <ProductPurchase
        gymId={gymId}
        quantity={quantity}
        selection={selection}
        onQuantityChange={setQuantity}
      />
    </>
  )
}
