export const PRODUCT_BY_HANDLE = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
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
`;
