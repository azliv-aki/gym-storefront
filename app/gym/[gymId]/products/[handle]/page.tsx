import { getProductByHandle } from '@/lib/shopify/products'
import { getCart, addToCart } from '@/lib/shopify/cart'
import ProductClient from './ProductClient'
import { getGym } from '@/lib/gym/gym'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    gymId: string
    handle: string
  }>
}

type PickupMethod = 'gym' | 'shipping'

type PickupContext = {
  /** この商品ページでのデフォルト選択 */
  defaultPickupMethod: PickupMethod
  /** このジムがジム受取を対応可能か */
  allowGymPickup: boolean
}

export default async function ProductPage(props: PageProps) {
  // URL paramsを解決
  const { gymId, handle } = await props.params

  // URLの商品ハンドルを元に商品情報を取得
  const product = await getProductByHandle(handle)
  if (!product) {
    return <div>Product not found</div>
  }

  const gym = getGym(gymId)

  // =========================
  // ジムがジム受取対応ならデフォルトはジム受取
  // =========================
  const allowGymPickup = gym.allowGymPickup
  const defaultPickupMethod: PickupMethod = allowGymPickup
    ? 'gym'
    : 'shipping'

  const pickupContext: PickupContext = {
    defaultPickupMethod,
    allowGymPickup,
  }

  return (
    <main style={{ padding: 24 }}>
      <p>Gym: {gymId}</p>
      <h1>{product.title}</h1>

      {product.image && (
        <img
          src={product.image.url}
          alt={product.image.altText ?? product.title}
          style={{ maxWidth: 400 }}
        />
      )}

      <ProductClient
        gymId={gymId}
        product={product}
        addToCart={addToCart}
        pickupContext={pickupContext}
      />
    </main>
  )
}
