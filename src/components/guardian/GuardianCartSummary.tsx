"use client";

import { useTranslations } from "next-intl";
import { Loader2, Lock } from "lucide-react";

interface GuardianCartSummaryProps {
  itemCount: number;
  cartTotal: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  deliveryMethod: "pickup" | "delivery";
  isPending: boolean;
  onCheckout: () => void;
}

export function GuardianCartSummary({
  itemCount,
  cartTotal,
  deliveryFee,
  discount,
  finalTotal,
  deliveryMethod,
  isPending,
  onCheckout,
}: GuardianCartSummaryProps) {
  const t = useTranslations("guardian");

  return (
    <div className="card pad">
      <h3
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "var(--olive)",
          marginBottom: 16,
        }}
      >
        {t("orderSummary")}
      </h3>

      <div className="row between" style={{ marginBottom: 10, fontSize: 13 }}>
        <span className="muted">
          {t("subtotal")} ({itemCount} {t("items")})
        </span>
        <span className="num" style={{ fontWeight: 700 }}>
          {cartTotal.toFixed(2)} {t("currency")}
        </span>
      </div>

      {deliveryMethod === "delivery" && (
        <div className="row between" style={{ marginBottom: 10, fontSize: 13 }}>
          <span className="muted">{t("deliveryFee")}</span>
          <span className="num" style={{ fontWeight: 700 }}>
            {deliveryFee.toFixed(2)} {t("currency")}
          </span>
        </div>
      )}

      {discount > 0 && (
        <div className="row between" style={{ marginBottom: 10, fontSize: 13 }}>
          <span className="muted">{t("membershipDiscount")}</span>
          <span className="num" style={{ fontWeight: 700, color: "var(--vitality)" }}>
            − {discount.toFixed(2)} {t("currency")}
          </span>
        </div>
      )}

      <div className="divider" style={{ margin: "14px 0" }} />

      <div className="row between" style={{ marginBottom: 20 }}>
        <span style={{ fontWeight: 800, fontSize: 14.5 }}>{t("total")}</span>
        <span className="num" style={{ fontWeight: 800, fontSize: 17, color: "var(--vitality)" }}>
          {finalTotal.toFixed(2)} {t("currency")}
        </span>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={onCheckout}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" width={16} height={16} />
            {t("processing")}
          </>
        ) : (
          t("placeOrder")
        )}
      </button>

      <p
        className="muted"
        style={{
          marginTop: 14,
          textAlign: "center",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Lock width={14} height={14} strokeWidth={2.5} />
        {t("secureTransaction")}
      </p>
    </div>
  );
}
