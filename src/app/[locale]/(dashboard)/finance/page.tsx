import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { financeService } from "@/services/finance.service";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";

import { OutstandingPaymentsWidget } from "@/components/home/OutstandingPaymentsWidget";

export default async function FinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { locale } = await params;
  const { month: m, year: y } = await searchParams;

  const session = await auth();
  if (!session) redirect(`/${locale}/login`);

  const t = await getTranslations("finance");

  const now = new Date();
  const month = m ? parseInt(m, 10) : now.getMonth() + 1;
  const year = y ? parseInt(y, 10) : now.getFullYear();

  const data = await financeService.getDashboard(
    session.user.clinicId as string,
    month,
    year,
  );

  return (
    <div className="min-h-screen pb-10 bg-mesh">
      <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-8 md:px-10 lg:px-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 opacity-80" />
        <h1 className="text-3xl font-black tracking-tight text-on-surface">
          {t("dashboard_title", { defaultMessage: "Finance Dashboard" })}
        </h1>
        <p className="text-sm font-medium text-on-surface-variant mt-1.5 opacity-80">
          {new Date(year, month - 1).toLocaleString(
            locale === "ar" ? "ar-EG" : "en-US",
            { month: "long", year: "numeric" },
          )}
        </p>
      </div>

      <div className="p-6 md:p-8 lg:p-10 xl:p-12 space-y-8 max-w-[1600px] mx-auto">
        <FinanceDashboard data={data} month={month} year={year} />
        <OutstandingPaymentsWidget />
      </div>
    </div>
  );
}
