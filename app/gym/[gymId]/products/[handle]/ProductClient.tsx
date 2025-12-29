'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import VariantSelector, { VariantSelectionResult } from '@/lib/components/VariantSelector'
import ProductPurchase from '@/lib/components/ProductPurchase'
import { Variant } from '@/lib/shopify/types'
import { Product } from '@/lib/shopify/types'

type PickupMethod = 'gym' | 'shipping'

type PickupContext = {
  cartPickupMode: 'empty' | 'gym' | 'shipping'
  defaultPickupMethod: PickupMethod
  allowGymPickup: boolean
}

export default function ProductClient({
  gymId,
  product,
  addToCart,
  pickupContext,
}: {
  gymId: string
  product: Product
  addToCart: (args: { variantId: string; quantity: number; gymId: string }) => Promise<string>
  pickupContext: PickupContext
}) {
  // ユーザーの商品選択の状態を保持
  const [selection, setSelection] = useState<VariantSelectionResult>({
    variant: null,
    isComplete: false,
    purchaseState: 'incomplete',
  })

  const [quantity, setQuantity] = useState(1)

  // 受取方法
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>(pickupContext.defaultPickupMethod)

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ジム受取の場合は商品ハンドルに-gympickがついた商品をカートへ追加
  const handlePurchase = async ({
    variantId,
    quantity,
    purchaseState,
  }: {
    variantId: string
    quantity: number
    purchaseState: 'available' | 'preorder'
  }) => {
    if (!selection.variant) return

    let targetVariantId = variantId

    // ジム受取の場合のみ商品ハンドルを差し替え
    if (pickupMethod === 'gym') {
      const res = await fetch('/api/resolve-gympick-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseVariantId: variantId,
          gymPickHandle: `${product.handle}-gympick`,
        }),
      })

      if (!res.ok) {
        alert('ジム受取用バリエーションを取得できません')
        return
      }

      const data: { variantId?: string } = await res.json()

      if (!data.variantId) {
        alert('このバリエーションはジム受取に対応していません')
        return
      }

      targetVariantId = data.variantId
    }

    // ===== server action =====
    startTransition(async () => {
      await addToCart({
        variantId: targetVariantId,
        quantity,
        gymId,
      })
    })
  }

  return (
    <>
      <VariantSelector
        variants={product.variants}
        value={selection.variant}
        onChange={setSelection}
      />

      {/* ===== 受取方法 ===== */}
      {pickupContext.allowGymPickup && (
        <div style={{ marginBottom: 16 }}>
          <label>
            受取方法
            <select
              value={pickupMethod}
              onChange={(e) => setPickupMethod(e.target.value as PickupMethod)}
              style={{ marginLeft: 8 }}
            >
              <option value="gym">ジム受取（住所入力不要）</option>
              <option value="shipping">自宅配送</option>
            </select>
          </label>
        </div>
      )}

      <ProductPurchase
        gymId={gymId}
        quantity={quantity}
        selection={selection}
        onQuantityChange={setQuantity}
        onPurchase={handlePurchase}
        disabled={isPending}
      />
    </>
  )
}
