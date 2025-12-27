'use client'

type Props = {
  totalAmount: {
    amount: string
    currencyCode: string
  }
  onCheckout: () => void
  disabled?: boolean
}

export default function CartSummary({ totalAmount, onCheckout, disabled = false }: Props) {
  return (
    <div style={{ marginTop: 24, opacity: disabled ? 0.5 : 1 }}>
      <p>
        合計: {Number(totalAmount.amount).toLocaleString()} {totalAmount.currencyCode}
      </p>

      <button onClick={onCheckout} disabled={disabled}>
        決済ページへ
      </button>
    </div>
  )
}
