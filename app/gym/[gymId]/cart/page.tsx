import { cookies } from 'next/headers'
import { getCart } from '@/lib/shopify/cart'
import CartClient from './CartClient'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: {
    gymId: string
  }
}

export default async function CartPage({ params }: PageProps) {
  const { gymId } = await params

  const cart = await getCart()

  if (!cart || cart.lines.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1>カート</h1>
        <p>カートは空です</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>カート</h1>

      <CartClient
        gymId={gymId}
        cart={cart}
      />
    </main>
  )
}
