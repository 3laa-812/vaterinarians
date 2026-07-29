import React, { forwardRef } from "react";
import type { InvoiceDetails } from "@/services/invoice.service";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface Props {
  invoice: InvoiceDetails;
}

export const Receipt80 = forwardRef<HTMLDivElement, Props>(
  ({ invoice }, ref) => {
    const t = useTranslations("printing");

    return (
      <div ref={ref} id="printable-receipt" className="bg-white text-black p-3 mx-auto" style={{ width: '80mm', fontSize: '12px', fontFamily: 'monospace' }}>
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg mb-1">{invoice.clinic.name}</h1>
          <p>{t("invoice")} #{invoice.invoiceNumber}</p>
          <p>{format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm")}</p>
        </div>

        <div className="border-t border-dashed border-black py-2 mb-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-bold">{t("owner")}</p>
              <p>{invoice.owner.name}</p>
            </div>
            {invoice.animal && (
              <div>
                <p className="font-bold">{t("patient")}</p>
                <p>{invoice.animal.name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-black py-2 mb-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-dashed border-black">
                <th className="py-1">{t("item")}</th>
                <th className="text-right py-1">{t("total")}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((p) => (
                <tr key={p.id}>
                  <td className="pr-2 py-2 align-top">{t("consultation")}</td>
                  <td className="text-right align-top py-2">{p.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {invoice.orders.map((o) =>
                o.items.map((item) => (
                  <tr key={item.id}>
                    <td className="pr-2 py-2 align-top">
                      {item.product.name}
                      {item.quantity > 1 && <div className="text-xs text-gray-600 mt-1">{item.quantity} x {item.unitPrice}</div>}
                    </td>
                    <td className="text-right align-top py-2">{item.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-dashed border-black py-2 mb-2">
          <div className="flex justify-between font-bold text-sm mb-1">
            <span>{t("totalAmount")}:</span>
            <span>{invoice.total.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>{t("paid")}:</span>
            <span>{invoice.paidAmount.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between">
            <span>{t("method")}:</span>
            <span>{invoice.paymentMethod || "Cash"}</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="font-bold">{t("dr")}: {invoice.createdBy?.name}</p>
          <p className="mt-2">{t("thankYou")}</p>
        </div>
      </div>
    );
  }
);

Receipt80.displayName = "Receipt80";
