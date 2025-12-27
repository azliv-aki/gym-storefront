// lib/shopify/cart.ts
'use server'

import { redirect } from 'next/navigation'
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

export async function addToCart({
  variantId,
  quantity,
  gymId,
}: {
  variantId: string
  quantity: number
  gymId: string
}) {
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

      redirect(`/gym/${gymId}/cart`)
    } catch (error) {
      // cartId が壊れてた → 下で作り直す
      cookieStore.delete('cartId')
    }
  }

  // ② cart がない or 壊れてたら新規作成
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

  redirect(`/gym/${gymId}/cart`)
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
  if (!data.cart) {
    return null
  }

  const cart = data.cart

  // 🧠 中身が空（商品消失）
  if (cart.lines.nodes.length === 0) {
    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: 0,
      cost: cart.cost,
      lines: [],
    }
  }

  // 🧠 checkoutUrl が無効
  if (!cart.checkoutUrl) {
    return null
  }

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

// 決済直前にカートを再チェック
export async function proceedToCheckout(): Promise<
  { ok: true; checkoutUrl: string } | { ok: false; reason: string }
> {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cartId')?.value

  if (!cartId) {
    return { ok: false, reason: 'カートが見つかりません' }
  }

  const data = await shopifyFetch<{ cart: any }>(CART_QUERY, { cartId })

  const cart = data.cart
  if (!cart) {
    cookieStore.delete('cartId')
    return { ok: false, reason: 'カートが失効しました' }
  }

  if (!cart.checkoutUrl) {
    cookieStore.delete('cartId')
    return { ok: false, reason: '決済URLを取得できませんでした' }
  }

  if (cart.lines.nodes.length === 0) {
    return { ok: false, reason: 'カートが空です' }
  }

  // merchandise が消えていないか
  for (const line of cart.lines.nodes) {
    if (!line.merchandise) {
      return { ok: false, reason: '販売終了した商品があります' }
    }
  }

  // 在庫チェック
  const invalidLine = cart.lines.nodes.find((line) => {
    const variant = line.merchandise

    const canPurchase = variant.availableForSale || variant.sellingPlanAllocations?.nodes.length > 0

    return !canPurchase
  })

  if (invalidLine) {
    return {
      ok: false,
      reason: `${invalidLine.merchandise.product.title} は現在購入できません`,
    }
  }

  return { ok: true, checkoutUrl: cart.checkoutUrl }
}
