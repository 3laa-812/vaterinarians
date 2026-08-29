"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderStatus, OrderPaymentStatus } from "@prisma/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { SkeletonList } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageSearch } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  total: number;
  createdAt: string;
  owner: {
    name: string;
    phone: string;
  };
}

export default function StoreOrdersPage() {
  const t = useTranslations("store");
  const locale = useParams().locale as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/orders");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.en || "Failed to fetch orders");
      setOrders(json.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">{t("status_pending")}</span>;
      case OrderStatus.CONFIRMED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">{t("status_confirmed")}</span>;
      case OrderStatus.READY:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info border border-info/20">{t("status_ready")}</span>;
      case OrderStatus.DELIVERED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">{t("status_delivered")}</span>;
      case OrderStatus.CANCELLED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">{t("status_cancelled")}</span>;
      default:
        return null;
    }
  };

  const getPaymentBadge = (status: OrderPaymentStatus) => {
    switch (status) {
      case OrderPaymentStatus.UNPAID:
        return <span className="text-error font-medium text-xs">{t("payment_unpaid")}</span>;
      case OrderPaymentStatus.PAID:
      case OrderPaymentStatus.CASH:
        return <span className="text-success font-medium text-xs">{t("payment_paid")}</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader title={t("orders")} subtitle={t("manageOrders")} />
        <SkeletonList count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="bg-error/10 border border-error/20 text-error rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="shrink-0" size={24} />
          <div>
            <h3 className="font-semibold">{t("error")}</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={t("orders")}
        subtitle={t("manageOrders")}
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/store`}>
              <Button variant="secondary" className="font-medium">
                {t("products")}
              </Button>
            </Link>
            <Button variant="secondary" className="flex items-center gap-2">
              <Filter size={18} />
              {t("filter")}
            </Button>
          </div>
        }
      />

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm whitespace-nowrap">
            <thead className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/50">
              <tr>
                <th className="px-6 py-4 font-semibold">{t("orderNumber")}</th>
                <th className="px-6 py-4 font-semibold">{t("customer")}</th>
                <th className="px-6 py-4 font-semibold">{t("date")}</th>
                <th className="px-6 py-4 font-semibold">{t("total")}</th>
                <th className="px-6 py-4 font-semibold">{t("status")}</th>
                <th className="px-6 py-4 font-semibold text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState icon={PackageSearch} message={t("noOrders")} />
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-medium text-on-surface">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-medium">{order.owner.name}</span>
                        <span className="text-on-surface-variant text-xs">{order.owner.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-on-surface font-semibold">{order.total.toFixed(2)} {t("currency")}</span>
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <Link href={`/${locale}/store/orders/${order.id}`}>
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center gap-1 group-hover:translate-x-1">
                          <span className="text-sm font-medium">{t("details")}</span>
                          <ChevronRight size={16} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
