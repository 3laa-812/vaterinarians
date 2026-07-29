import React, { forwardRef } from "react";
import type { InvoiceDetails } from "@/services/invoice.service";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface Props {
  invoice: InvoiceDetails;
}

export const Receipt58 = forwardRef<HTMLDivElement, Props>(
  ({ invoice }, ref) => {
    const t = useTranslations("printing");

    return (
      <div ref={ref} id="printable-receipt" className="bg-white text-black p-2 mx-auto" style={{ width: '58mm', fontSize: '10px', fontFamily: 'monospace' }}>
        <div className="text-center mb-3">
          <h1 className="font-bold text-sm">{invoice.clinic.name}</h1>
          <p>{t("invoice")} #{invoice.invoiceNumber}</p>
          <p>{format(new Date(invoice.createdAt), "dd/MM/yy HH:mm")}</p>
        </div>

        <div className="border-t border-dashed border-black py-2 mb-2">
          <p><span className="font-bold">{t("owner")}:</span> {invoice.owner.name}</p>
          {invoice.animal && (
            <p><span className="font-bold">{t("patient")}:</span> {invoice.animal.name}</p>
          )}
        </div>

        <div className="border-t border-dashed border-black py-2 mb-2">
          <table className="w-full text-left">
            <tbody>
              {invoice.payments.map((p) => (
                <tr key={p.id}>
                  <td className="pr-1 py-1 align-top">{t("consultation")}</td>
                  <td className="text-right align-top py-1">{p.totalAmount}</td>
                </tr>
              ))}
              {invoice.orders.map((o) =>
                o.items.map((item) => (
                  <tr key={item.id}>
                    <td className="pr-1 py-1 align-top">
                      {item.product.name}
                      {item.quantity > 1 && <div className="text-[8px]">{item.quantity} x {item.unitPrice}</div>}
                    </td>
                    <td className="text-right align-top py-1">{item.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-dashed border-black py-2 mb-2">
          <div className="flex justify-between font-bold">
            <span>{t("total")}:</span>
            <span>{invoice.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("paid")}:</span>
            <span>{invoice.paidAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center mt-4">
          <p>{t("dr")}: {invoice.createdBy?.name}</p>
          <p className="mt-2">{t("thankYou")}</p>
        </div>
      </div>
    );
  }
);

Receipt58.displayName = "Receipt58";
