"use client";

import { useGuardianOrders } from "@/hooks/useGuardian";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n-navigation";
import { CheckCircle2, Package, Clock, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

export default function GuardianOrdersPage() {
  const t = useTranslations("guardian");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading } = useGuardianOrders();

  const orders = data?.orders || [];

  return (
    <div className="font-body-md antialiased">
      <div className="mb-6 text-right">
        <p className="text-[13px] text-[var(--ink-soft)]">{t("myOrdersDesc")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="guardian-card h-32 animate-pulse bg-[var(--cream)]"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--sage-soft)] text-[var(--sage)]">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-extrabold text-[var(--olive)]">
            {t("emptyOrders")}
          </h3>
          <p className="mb-6 text-[13.5px] text-[var(--ink-soft)]">
            {t("emptyOrdersDesc")}
          </p>
          <button
            type="button"
            onClick={() => router.push("/guardian/store")}
            className="rounded-full bg-gradient-to-br from-[var(--olive-2)] to-[var(--olive)] px-6 py-3 text-sm font-bold text-[var(--cream)]"
          >
            {t("browseStore")}
          </button>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="guardian-grid-2"
        >
          {orders.map((order) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 300, damping: 24 },
                },
              }}
              key={order.id}
              onClick={() => router.push(`/guardian/orders/${order.id}`)}
              className="guardian-card flex cursor-pointer flex-col p-[22px] transition-shadow hover:shadow-[var(--shadow-lg)]"
            >
              <div className="mb-4 flex flex-row-reverse items-center justify-between">
                <div
                  className={`flex flex-row-reverse items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    order.status === "DELIVERED" ||
                    order.status === "COMPLETED" ||
                    order.status === "READY"
                      ? "bg-[var(--good-soft)] text-[var(--good)]"
                      : "bg-[var(--sage-soft)] text-[var(--olive)]"
                  }`}
                >
                  {order.status === "DELIVERED" ||
                  order.status === "COMPLETED" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                  <span>{order.status}</span>
                </div>
                <p className="guardian-num text-sm text-[var(--ink-soft)]">
                  #{order.orderNumber}
                </p>
              </div>

              <div className="mt-auto flex flex-row-reverse items-end justify-between border-t border-[var(--line)] pt-4">
                <div className="text-right">
                  <p className="mb-1 text-xs text-[var(--ink-soft)]">
                    {new Date(order.createdAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="guardian-num text-lg font-extrabold text-[var(--olive)]">
                    {order.totalAmount}{" "}
                    <span className="text-sm font-medium">{t("currency")}</span>
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cream)] text-[var(--olive)] transition-colors group-hover:bg-[var(--sage-soft)]">
                  <ChevronLeft size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
