import React from "react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { invoiceService } from "@/services/invoice.service";
import { InvoicePreview } from "@/components/printing/InvoicePreview";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function InvoicePrintPage({ params }: PageProps) {
  const { locale, id } = await params;
  
  const session = await auth();
  if (!session) redirect(`/${locale}/login`);
  
  const t = await getTranslations("printing");
  
  const invoice = await invoiceService.getInvoiceDetails(id, session.user.clinicId as string);
  
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-error">{t("invoiceNotFound", { defaultMessage: "Invoice not found" })}</h2>
        <p className="text-on-surface-variant mt-2">{t("invoiceNotFoundDesc", { defaultMessage: "The requested invoice could not be found or you do not have permission to view it." })}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-surface">
      <InvoicePreview invoice={invoice} />
    </div>
  );
}
