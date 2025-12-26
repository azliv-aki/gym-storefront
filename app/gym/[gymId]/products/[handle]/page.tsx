import { getProductByHandle } from '@/lib/shopify/products'
import { addToCart } from '@/lib/shopify/cart'
import ProductClient from './ProductClient'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    gymId: string
    handle: string
  }>
}

export default async function ProductPage(props: PageProps) {

  // URL paramsを解決
  const { gymId, handle } = await props.params

  // URLの商品ハンドルを元に商品情報を取得
  const product = await getProductByHandle(handle)
  if (!product) {
    return <div>Product not found</div>
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
      />
    </main>
  )
}
