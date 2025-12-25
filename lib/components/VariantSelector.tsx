'use client'

import { useState, useEffect } from 'react'
import { Variant } from '@/lib/shopify/types'

/* =====================
 * Types
 * ===================== */

type OptionMap = {
  [optionName: string]: string[]
}

type OptionState = 'active' | 'disabled' | 'soldout'

export type VariantSelectionResult = {
  variant: Variant | null
  isComplete: boolean
  purchaseState: 'incomplete' | 'available' | 'preorder' | 'soldout'
}

/* =====================
 * Component
 * ===================== */

export default function VariantSelector({
  variants,
  value,
  onChange,
}: {
  variants: Variant[]
  value: Variant | null
  onChange: (result: VariantSelectionResult) => void
}) {
  // variantsを入力として選択肢を展開
  const optionMap = buildOptionMap(variants)
  const optionNames = Object.keys(optionMap)

  // UI操作の途中経過を保存
  const [selected, setSelected] = useState<Record<string, string>>({})

  const isSelectionComplete = variants[0].selectedOptions.every(
    (opt) => selected[opt.name] !== undefined
  )

  const selectedVariant = findExactVariant(variants, selected)

  const purchaseState = getPurchaseState(selectedVariant, isSelectionComplete)

  useEffect(() => {
    onChange({
      variant: selectedVariant,
      isComplete: isSelectionComplete,
      purchaseState,
    })
  }, [selectedVariant, isSelectionComplete, purchaseState, onChange])

  return (
    <div>
      {optionNames.map((optionName) => (
        <div key={optionName}>
          <p>{optionName}</p>

          {optionMap[optionName].map((value) => {
            const state = getOptionState(variants, selected, optionName, value)

            return (
              <button
                key={value}
                disabled={state !== 'active'}
                onClick={() =>
                  setSelected((prev) => ({
                    ...prev,
                    [optionName]: value,
                  }))
                }
                style={{
                  marginRight: 8,
                  opacity: state === 'active' ? 1 : 0.4,
                  fontWeight: selected[optionName] === value ? 'bold' : 'normal',
                }}
              >
                {value}
                {state === 'soldout' && '（在庫切れ）'}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* =====================
 * Helpers（重要）
 * ===================== */

function buildOptionMap(variants: Variant[]): OptionMap {
  const map: OptionMap = {}

  variants.forEach((variant) => {
    variant.selectedOptions.forEach(({ name, value }) => {
      if (!map[name]) map[name] = []
      if (!map[name].includes(value)) {
        map[name].push(value)
      }
    })
  })

  return map
}

function findExactVariant(variants: Variant[], selected: Record<string, string>): Variant | null {
  return (
    variants.find((variant) =>
      variant.selectedOptions.every((opt) => selected[opt.name] === opt.value)
    ) ?? null
  )
}

function getOptionState(
  variants: Variant[],
  selected: Record<string, string>,
  optionName: string,
  optionValue: string
): OptionState {
  const relatedVariants = variants.filter((variant) =>
    variant.selectedOptions.some((opt) => opt.name === optionName && opt.value === optionValue)
  )

  const hasPurchasable = relatedVariants.some(isPurchasable)
  if (!hasPurchasable) return 'soldout'

  const isSelectable = relatedVariants.some((variant) => {
    if (!isPurchasable(variant)) return false

    return variant.selectedOptions.every((opt) => {
      if (opt.name === optionName) return true
      return selected[opt.name] === undefined || selected[opt.name] === opt.value
    })
  })

  return isSelectable ? 'active' : 'disabled'
}

function isPurchasable(variant: Variant): boolean {
  if (variant.availableForSale) return true
  if (variant.sellingPlanAllocations?.nodes.length) return true
  return false
}

function getPurchaseState(
  variant: Variant | null,
  isComplete: boolean
): 'incomplete' | 'available' | 'preorder' | 'soldout' {
  if (!isComplete || !variant) return 'incomplete'

  if (variant.sellingPlanAllocations?.nodes.length) {
    return 'preorder'
  }

  if (!variant.availableForSale) {
    return 'soldout'
  }

  return 'available'
}
