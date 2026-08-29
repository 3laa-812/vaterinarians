import React, { forwardRef } from "react";
import type { InvoiceDetails } from "@/services/invoice.service";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface Props {
  invoice: InvoiceDetails;
}

export const InvoiceA4 = forwardRef<HTMLDivElement, Props>(
  ({ invoice }, ref) => {
    const t = useTranslations("printing");

    return (
      <div ref={ref} id="printable-invoice" className="bg-white text-black p-8 text-sm max-w-4xl mx-auto w-[210mm] min-h-[297mm]">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold">{invoice.clinic.name}</h1>
            {invoice.clinic.address && <p>{invoice.clinic.address}</p>}
            {invoice.clinic.phone && <p>{invoice.clinic.phone}</p>}
          </div>
          <div className="text-end">
            <h2 className="text-2xl font-bold uppercase text-gray-400">{t("invoice")}</h2>
            <p className="font-medium mt-1">#{invoice.invoiceNumber}</p>
            <p className="text-gray-500">{format(new Date(invoice.createdAt), "dd MMM yyyy, HH:mm")}</p>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">{t("billTo")}</h3>
            <p className="font-bold">{invoice.owner.name}</p>
            <p>{invoice.owner.phone}</p>
            {invoice.animal && (
              <p className="mt-2 text-gray-600">
                <span className="font-medium">{t("patient")}:</span> {invoice.animal.name} ({invoice.animal.species})
              </p>
            )}
          </div>
          <div className="text-end">
            <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">{t("paymentDetails")}</h3>
            <p><span className="font-medium">{t("method")}:</span> {invoice.paymentMethod || "N/A"}</p>
            <p><span className="font-medium">{t("status")}:</span> {t(invoice.status.toLowerCase())}</p>
            <p><span className="font-medium">{t("createdBy")}:</span> {invoice.createdBy?.name}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-start py-2">{t("item")}</th>
              <th className="text-start py-2">{t("category")}</th>
              <th className="text-end py-2">{t("qty")}</th>
              <th className="text-end py-2">{t("unitPrice")}</th>
              <th className="text-end py-2">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {/* Payments/Appointments */}
            {invoice.payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-3">
                  <div className="font-medium">{t("consultation")}</div>
                  {p.appointment.session?.diagnosis && (
                    <div className="text-xs text-gray-500">{p.appointment.session.diagnosis}</div>
                  )}
                </td>
                <td className="py-3 text-gray-600">{t("service")}</td>
                <td className="py-3 text-end">1</td>
                <td className="py-3 text-end">{p.totalAmount.toFixed(2)}</td>
                <td className="py-3 text-end">{p.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
            
            {/* Order Items */}
            {invoice.orders.map((o) =>
              o.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 font-medium">{item.product.name}</td>
                  <td className="py-3 text-gray-600">{item.product.category}</td>
                  <td className="py-3 text-end">{item.quantity}</td>
                  <td className="py-3 text-end">{item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-end">{item.total.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">{t("subtotal")}</span>
              <span>{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between py-1 text-red-500">
                <span>{t("discount")}</span>
                <span>-{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">{t("tax")}</span>
                <span>{invoice.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t-2 border-black font-bold text-lg mt-2">
              <span>{t("totalAmount")}</span>
              <span>{invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">{t("paid")}</span>
              <span>{invoice.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 font-medium">
              <span>{t("remaining")}</span>
              <span>{(invoice.total - invoice.paidAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-xs">
          <p>{t("thankYou")}</p>
        </div>
      </div>
    );
  }
);

InvoiceA4.displayName = "InvoiceA4";
