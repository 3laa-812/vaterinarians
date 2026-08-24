import { GuardianShell } from "@/components/guardian/layout/GuardianShell";

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuardianShell>{children}</GuardianShell>;
}
