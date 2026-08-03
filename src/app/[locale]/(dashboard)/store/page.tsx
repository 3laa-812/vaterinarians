"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/shared/Button";
import { SkeletonList } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PackageSearch, Plus, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  isActive: boolean;
}

export default function StoreDashboardPage() {
  const t = useTranslations("store");
  const locale = useParams().locale as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/products");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.en || "Failed to fetch");
      setProducts(json.data.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/store/products/${deleteProductId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.en || "Failed to delete");
      }
      setProducts(products.filter((p) => p.id !== deleteProductId));
      setDeleteProductId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader title={t("products")} subtitle={t("manageProducts")} />
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
    <div className="bg-mesh min-h-full">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
        title={t("products")}
        subtitle={t("manageProducts")}
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/store/orders`}>
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <PackageSearch size={18} />
                {t("orders")}
              </Button>
            </Link>
            <Link href={`/${locale}/store/new`}>
              <Button className="inline-flex items-center gap-2">
                <Plus size={18} />
                {t("addProduct")}
              </Button>
            </Link>
          </div>
        }
      />

      {lowStockProducts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 text-warning rounded-2xl p-5 flex items-center gap-3">
          <AlertCircle className="shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-on-surface">{t("lowStockWarning")}</h3>
            <p className="text-sm">{t("lowStockMessage", { count: lowStockProducts.length })}</p>
          </div>
        </div>
      )}

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant/50">
              <tr>
                <th className="px-6 py-4 font-semibold">{t("name")}</th>
                <th className="px-6 py-4 font-semibold">{t("category")}</th>
                <th className="px-6 py-4 font-semibold">{t("price")}</th>
                <th className="px-6 py-4 font-semibold">{t("stock")}</th>
                <th className="px-6 py-4 font-semibold">{t("status")}</th>
                <th className="px-6 py-4 font-semibold text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState icon={PackageSearch} message={t("noProducts")} />
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container transition-colors group">
                    <td className="px-6 py-4 font-medium text-on-surface">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/50">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface">{p.price.toFixed(2)} {t("currency")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.stock <= p.minStock ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                          {t("active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
                          {t("inactive")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/${locale}/store/${p.id}/edit`}>
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button 
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          onClick={() => setDeleteProductId(p.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!!deleteProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-high border border-outline-variant rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/50">
              <span className="font-semibold text-lg text-on-surface">{t("deleteProduct")}</span>
              <button 
                onClick={() => setDeleteProductId(null)}
                className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-on-surface-variant mb-6">
                {t("deleteConfirmation")}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDeleteProductId(null)} disabled={isDeleting}>
                  {t("cancel")}
                </Button>
                <Button variant="primary" className="bg-error hover:bg-error/90 text-on-error border-error hover:border-error/90" onClick={handleDelete} loading={isDeleting}>
                  {t("delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
