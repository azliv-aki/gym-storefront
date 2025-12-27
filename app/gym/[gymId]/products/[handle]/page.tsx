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
  /** 今のカート全体としての受取モード */
  cartPickupMode: 'empty' | 'gym' | 'shipping'

  /** この商品ページでのデフォルト選択 */
  defaultPickupMethod: PickupMethod

  /** ユーザーが切り替え可能か */
  canSwitch: boolean

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

  // カート情報を取得
  const cart = await getCart()

  // =========================
  // カート内の世界線判定
  // =========================

  const hasGymPickInCart =
    cart?.lines.some((line) => line.merchandise?.product?.handle?.endsWith('-gympick')) ?? false

  const hasShippingInCart =
    cart?.lines.some((line) => !line.merchandise?.product?.handle?.endsWith('-gympick')) ?? false

  let cartPickupMode: PickupContext['cartPickupMode'] = 'empty'
  if (hasGymPickInCart && hasShippingInCart) {
    // 異常状態（基本起きない想定）
    // shipping に倒す or エラー扱い
    cartPickupMode = 'shipping'
  } else if (hasGymPickInCart) {
    cartPickupMode = 'gym'
  } else if (hasShippingInCart) {
    cartPickupMode = 'shipping'
  }

  // =========================
  // この商品でジム受取を許可するか
  // ・商品ハンドルでは判定しない
  // ・gym 設定だけを見る
  // =========================
  const allowGymPickup = gym.allowGymPickup

  // =========================
  // デフォルト選択 & 切替可否
  // =========================
  let defaultPickupMethod: PickupMethod
  let canSwitch: boolean

  if (cartPickupMode === 'gym') {
    defaultPickupMethod = 'gym'
    canSwitch = false
  } else if (cartPickupMode === 'shipping') {
    defaultPickupMethod = 'shipping'
    canSwitch = false
  } else {
    // cart empty
    defaultPickupMethod = allowGymPickup ? 'gym' : 'shipping'
    canSwitch = true
  }

  const pickupContext: PickupContext = {
    cartPickupMode,
    defaultPickupMethod,
    canSwitch,
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
