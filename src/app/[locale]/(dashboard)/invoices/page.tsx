import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { invoiceService } from "@/services/invoice.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvoiceList } from "@/components/invoices/InvoiceList";

export default async function InvoicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;

  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  const t = await getTranslations("printing");
  const currentPage = page ? parseInt(page, 10) : 1;

  const data = await invoiceService.getInvoices(
    session.user.clinicId as string,
    currentPage,
  );

  return (
    <div className="min-h-screen pb-10 bg-surface">
      <PageHeader title={t("invoicesTitle")} subtitle={t("invoicesSubtitle")} />
      <div className="p-6 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
        <InvoiceList initialData={data} />
      </div>
    </div>
  );
}
