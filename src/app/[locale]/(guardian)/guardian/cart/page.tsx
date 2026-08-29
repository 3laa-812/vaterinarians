"use client";

import { useGuardianCartStore } from "@/store/useGuardianCartStore";
import { useGuardianCreateOrder } from "@/hooks/useGuardian";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n-navigation";
import { toast } from "sonner";
import { useState } from "react";
import { ShoppingBag, ShoppingCart, Truck, Store, X } from "lucide-react";
import { GuardianCartSummary } from "@/components/guardian/GuardianCartSummary";
import { EmptyState } from "@/components/shared/EmptyState";

export default function GuardianCartPage() {
  const t = useTranslations("guardian");
  const router = useRouter();
  const createOrderMutation = useGuardianCreateOrder();
  const { items, updateQuantity, removeItem, clearCart, getTotal } =
    useGuardianCartStore();

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const cartTotal = getTotal();
  const deliveryFee = deliveryMethod === "delivery" ? 35 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (deliveryMethod === "delivery" && !address.trim()) {
      toast.error(t("enterAddressMsg"));
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        deliveryMethod,
        notes:
          deliveryMethod === "delivery"
            ? `Address: ${address}\nNotes: ${notes}`
            : notes,
      });
      clearCart();
      toast.success(t("orderPlaced"));
      router.push("/guardian/orders");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("orderFailed");
      toast.error(message);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        variant="guardian"
        icon={ShoppingCart}
        title={t("emptyCart")}
        message={t("emptyCartDesc")}
        actionLabel={t("browseStore")}
        onAction={() => router.push("/guardian/store")}
      />
    );
  }

  return (
    <div>
      <div className="cart-grid">
        <div className="card">
          {items.map((item) => (
            <div key={item.productId} className="list-row">
              <div
                className="list-thumb"
                style={{ background: "var(--sage-soft)" }}
              >
                <ShoppingBag strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{item.name}</div>
                <div className="muted num" style={{ fontSize: 12 }}>
                  {item.price} {t("currency")}
                </div>
              </div>
              <div className="qty">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                >
                  −
                </button>
                <span className="num">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="icon-btn btn-icon"
                style={{ width: 34, height: 34 }}
                onClick={() => removeItem(item.productId)}
                aria-label={t("close")}
              >
                <X width={15} height={15} stroke="var(--danger)" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          <div className="card pad">
            <h3
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--olive)",
                marginBottom: 14,
              }}
            >
              {t("deliveryMethod")}
            </h3>
            <div className="grid2">
              <button
                type="button"
                className={`select-card${deliveryMethod === "delivery" ? " picked" : ""}`}
                onClick={() => setDeliveryMethod("delivery")}
              >
                <Truck strokeWidth={2} />
                <div className="text-end">
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t("delivery")}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    {t("deliveryTime")}
                  </div>
                </div>
              </button>
              <button
                type="button"
                className={`select-card${deliveryMethod === "pickup" ? " picked" : ""}`}
                onClick={() => setDeliveryMethod("pickup")}
              >
                <Store strokeWidth={2} />
                <div className="text-end">
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t("pickup")}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    {t("pickupTime")}
                  </div>
                </div>
              </button>
            </div>

            {deliveryMethod === "delivery" && (
              <div style={{ marginTop: 16 }}>
                <label className="field-label">{t("addressDetails")}</label>
                <textarea
                  className="input"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("addressPlaceholder")}
                  style={{ marginBottom: 12, resize: "none" }}
                />
                <label className="field-label">{t("additionalNotes")}</label>
                <input
                  className="input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("notesPlaceholder")}
                />
              </div>
            )}
          </div>

          <GuardianCartSummary
            itemCount={items.reduce((acc, i) => acc + i.quantity, 0)}
            cartTotal={cartTotal}
            deliveryFee={deliveryFee}
            discount={0}
            finalTotal={finalTotal}
            deliveryMethod={deliveryMethod}
            isPending={createOrderMutation.isPending}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
