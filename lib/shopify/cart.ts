// lib/shopify/cart.ts
'use server'

import { cookies } from 'next/headers'
import { shopifyFetch } from './client'
import {
  CART_CREATE,
  CART_LINES_ADD,
  CART_QUERY,
  CART_LINES_UPDATE,
  CART_LINES_REMOVE,
} from './queries'
import { Cart } from './types'

export async function addToCart({ variantId, quantity }: { variantId: string; quantity: number }) {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cartId')?.value

  // ① 既存 cart がある場合は追加を試みる
  if (cartId) {
    try {
      await shopifyFetch(CART_LINES_ADD, {
        cartId,
        lines: [
          {
            merchandiseId: variantId,
            quantity,
          },
        ],
      })

      return cartId
    } catch (error) {
      // cartId が無効なら作り直す
      console.warn('Cart invalid, recreating', error)
    }
  }

  // ② cart がなければ新規作成
  const data = await shopifyFetch<{
    cartCreate: {
      cart: { id: string }
    }
  }>(CART_CREATE, {
    lines: [
      {
        merchandiseId: variantId,
        quantity,
      },
    ],
  })

  const newCartId = data.cartCreate.cart.id

  // ③ cookie に保存
  cookieStore.set('cartId', newCartId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })

  return newCartId
}
// カート情報を取得
export async function getCart(): Promise<Cart | null> {
  // ① cartId を「サーバー文脈」から取得
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cartId')?.value

  // ② cartId がなければ「カートなし」
  if (!cartId) return null

  // ③ Shopify に問い合わせ
  const data = await shopifyFetch<{
    cart: any
  }>(CART_QUERY, { cartId })

  // ④ cart が無効 / 失効していた場合
  if (!data.cart) return null

  // ⑤ UI 用の形に整形
  return {
    id: data.cart.id,
    checkoutUrl: data.cart.checkoutUrl,
    totalQuantity: data.cart.totalQuantity,
    cost: data.cart.cost,
    lines: data.cart.lines.nodes,
  }
}

/**
 * カート内数量変更
 */
export async function updateCartLine({ lineId, quantity }: { lineId: string; quantity: number }) {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cartId')?.value
  if (!cartId) return

  await shopifyFetch(CART_LINES_UPDATE, {
    cartId,
    lines: [{ id: lineId, quantity }],
  })
}

/**
 * カート内商品削除
 */
export async function removeCartLine({ lineId }: { lineId: string }) {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cartId')?.value
  if (!cartId) return

  await shopifyFetch(CART_LINES_REMOVE, {
    cartId,
    lineIds: [lineId],
  })
}
