'use client'

import { useRouter } from 'next/navigation'
import CartItemRow from '@/lib/components/CartItemRow'
import CartSummary from '@/lib/components/CartSummary'
import { updateCartLine, removeCartLine } from '@/lib/shopify/cart'
import { Cart } from '@/lib/shopify/types'

export default function CartClient({
  gymId,
  cart,
}: {
  gymId: string
  cart: Cart
}) {
  const router = useRouter()

  const handleQuantityChange = async (
    lineId: string,
    quantity: number
  ) => {
    await updateCartLine({ lineId, quantity })
    router.refresh()
  }

  const handleRemove = async (lineId: string) => {
    await removeCartLine({ lineId })
    router.refresh()
  }

  return (
    <div>
      {cart.lines.map((line) => (
        <CartItemRow
          key={line.id}
          line={line}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
        />
      ))}

      <CartSummary
        totalAmount={cart.cost.totalAmount}
        onCheckout={() => {
          window.location.href = cart.checkoutUrl
        }}
      />
    </div>
  )
}
