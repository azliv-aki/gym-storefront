export const PRODUCT_BY_HANDLE = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description

      images(first: 1) {
        nodes {
          url
          altText
        }
      }

      variants(first: 50) {
        nodes {
          id
          title
          availableForSale

          selectedOptions {
            name
            value
          }

          sellingPlanAllocations(first: 5) {
            nodes {
              sellingPlan {
                id
                name
                description
              }
            }
          }
        }
      }

      sellingPlanGroups(first: 5) {
        nodes {
          name
          sellingPlans(first: 5) {
            nodes {
              id
              name
              description
            }
          }
        }
      }
    }
  }
`

/* =====================
 * Cart Create
 * ===================== */

export const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

/* =====================
 * Cart Lines Add
 * ===================== */

export const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

/* =====================
 * Cart Query（取得）
 * ===================== */

export const CART_QUERY = `
  query CartQuery($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 50) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              sellingPlanAllocations(first: 1) {
                nodes {
                  sellingPlan {
                    id
                    name
                  }
                }
              }
              product {
                title
              }
            }
          }
        }
      }
    }
  }
`

/* =====================
 * Cart Lines Update（数量変更）
 * ===================== */

export const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`

/* =====================
 * Cart Lines Remove（削除）
 * ===================== */

export const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`
