// lib/shopify/products.ts

import { shopifyFetch } from './client'
import { PRODUCT_BY_HANDLE } from './queries'
import { Variant } from './types'

export async function getProductByHandle(handle: string) {
  if (!handle) throw new Error('handle is missing')

  const data = await shopifyFetch<{
    productByHandle: {
      id: string
      title: string
      description: string
      images: {
        nodes: {
          url: string
          altText: string | null
        }[]
      }
      variants: {
        nodes: Variant[]
      }
    } | null
  }>(PRODUCT_BY_HANDLE, { handle })

  const product = data.productByHandle
  if (!product) return null

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    image: product.images.nodes[0] ?? null,
    variants: product.variants.nodes,
  }
}
