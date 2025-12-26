/* =====================
 * Shopify Domain Types
 * ===================== */

export type SellingPlan = {
  id: string
  name: string
  description?: string | null
}

export type Variant = {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: {
    name: string
    value: string
  }[]
  sellingPlanAllocations?: {
    nodes: {
      sellingPlan: SellingPlan
    }[]
  }
}

export type Product = {
  id: string
  title: string
  image?: {
    url: string
    altText?: string | null
  }
  variants: Variant[]
}

export type Cart = {
  id: string
  checkoutUrl: string
  lines: CartLine[]
  cost: {
    totalAmount: Money
  }
}

export type CartLine = {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: {
      id: string
      title: string
    }
  }
  cost: {
    totalAmount: Money
  }
}
