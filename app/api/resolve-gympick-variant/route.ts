import { NextRequest, NextResponse } from 'next/server'
import { getProductByHandle } from '@/lib/shopify/products'
import { shopifyFetch } from '@/lib/shopify/client'

export async function POST(req: NextRequest) {
  try {
    const { baseVariantId, gymPickHandle } = await req.json()

    console.log('[resolve] input', { baseVariantId, gymPickHandle })

    if (!baseVariantId || !gymPickHandle) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // ① gympick 商品を取得
    const gymPickProduct = await getProductByHandle(gymPickHandle)

    console.log('[resolve] gymPickProduct', {
      exists: !!gymPickProduct,
      variantCount: gymPickProduct?.variants.length,
      variants: gymPickProduct?.variants.map(v => ({
        id: v.id,
        options: v.selectedOptions,
      })),
    })

    if (!gymPickProduct) {
      return NextResponse.json({})
    }

    // ② base variant の option を取得
    const baseVariant = await fetchVariantById(baseVariantId)

    console.log('[resolve] baseVariant', baseVariant)

    if (!baseVariant) {
      return NextResponse.json({})
    }

    const baseOptions = normalizeOptions(baseVariant.selectedOptions)

    // ③ option 完全一致の variant を探す
    const matched = gymPickProduct.variants.find((v) => {
      const targetOptions = normalizeOptions(v.selectedOptions)
      return isSameOptions(baseOptions, targetOptions)
    })

    console.log('[resolve] matched', matched?.id)

    if (!matched) {
      return NextResponse.json({})
    }

    return NextResponse.json({ variantId: matched.id })
  } catch (err) {
    console.error('[resolve-gympick-variant ERROR]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/* ===============================
   util
================================ */

function normalizeOptions(
  options: { name: string; value: string }[]
): Record<string, string> {
  return Object.fromEntries(
    options.map(o => [o.name.toLowerCase(), o.value])
  )
}

function isSameOptions(
  a: Record<string, string>,
  b: Record<string, string>
) {
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every(k => a[k] === b[k])
}

async function fetchVariantById(
  variantId: string
): Promise<{ selectedOptions: { name: string; value: string }[] } | null> {
  const query = `
    query ($id: ID!) {
      node(id: $id) {
        ... on ProductVariant {
          selectedOptions {
            name
            value
          }
        }
      }
    }
  `

  const data = await shopifyFetch<{
    node: {
      selectedOptions: { name: string; value: string }[]
    } | null
  }>(query, { id: variantId })

  return data.node ?? null
}
