'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import VariantSelector, { VariantSelectionResult } from '@/lib/components/VariantSelector'
import ProductPurchase from '@/lib/components/ProductPurchase'
import { Variant } from '@/lib/shopify/types'
import { Product } from '@/lib/shopify/types'

export default function ProductClient({
  gymId,
  product,
  addToCart,
}: {
  gymId: string
  product: Product
  addToCart: (args: { variantId: string; quantity: number }) => Promise<string>
}) {
  // ユーザーの商品選択の状態を保持
  const [selection, setSelection] = useState<VariantSelectionResult>({
    variant: null,
    isComplete: false,
    purchaseState: 'incomplete',
  })

  const [quantity, setQuantity] = useState(1)

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handlePurchase = ({
    variantId,
    quantity,
    purchaseState,
  }: {
    variantId: string
    quantity: number
    purchaseState: 'available' | 'preorder'
  }) => {
    startTransition(async () => {
      await addToCart({
        variantId,
        quantity,
      })

      router.push(`/gym/${gymId}/cart`)
    })
  }

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
        onPurchase={handlePurchase}
      />
    </>
  )
}
