'use client'

export default function CartSummary({
  totalAmount,
  onCheckout,
}: {
  totalAmount: {
    amount: string
    currencyCode: string
  }
  onCheckout: () => void
}) {
  return (
    <div style={{ marginTop: 24 }}>
      <p>
        合計: {totalAmount.amount} {totalAmount.currencyCode}
      </p>

      <button onClick={onCheckout}>
        決済ページへ
      </button>
    </div>
  )
}
