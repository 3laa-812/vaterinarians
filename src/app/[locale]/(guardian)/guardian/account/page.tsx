"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n-navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  useGuardianAccount,
  useUpdateGuardianAccount,
} from "@/hooks/useGuardian";
import { Bell, Package, Activity, LogOut, Loader2 } from "lucide-react";

function PreferenceToggle({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ComponentType<{ strokeWidth?: number }>;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="set-row">
      <div className="set-icon">
        <Icon strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
        <div className="muted" style={{ fontSize: 11.5 }}>
          {description}
        </div>
      </div>
      <button
        type="button"
        className={`toggle${enabled ? " on" : ""}`}
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label={title}
      />
    </div>
  );
}

export default function GuardianAccountPage() {
  const t = useTranslations("guardian");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading } = useGuardianAccount();
  const updateAccount = useUpdateGuardianAccount();

  const [name, setName] = useState("");
  const [prefs, setPrefs] = useState({
    apptReminder: true,
    orderUpdate: true,
    vaccineReminder: true,
  });

  useEffect(() => {
    if (data?.account) {
      setName(data.account.name);
      setPrefs({
        apptReminder: data.account.apptReminder,
        orderUpdate: data.account.orderUpdate,
        vaccineReminder: data.account.vaccineReminder,
      });
    }
  }, [data?.account]);

  const handleSave = async () => {
    try {
      await updateAccount.mutateAsync({ name, ...prefs });
      toast.success(t("saveChanges"));
    } catch {
      toast.error(t("failedToSave"));
    }
  };

  const handlePrefToggle = (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    updateAccount.mutate({ name, ...next });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/guardian/login" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[var(--olive)]" />
      </div>
    );
  }

  const phone = data?.account?.phone ?? "—";

  return (
    <div>
      <div className="grid2" style={{ alignItems: "start" }}>
        <div className="card pad">
          <h4
            style={{
              fontWeight: 800,
              color: "var(--olive)",
              fontSize: 13.5,
              marginBottom: 14,
            }}
          >
            {t("personalInfo")}
          </h4>

          <div style={{ marginBottom: 12 }}>
            <label className="field-label">{t("name")}</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="field-label">{t("phone")}</label>
            <input
              className="input num"
              style={{ direction: "ltr", textAlign: "right" }}
              value={phone}
              readOnly
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="field-label">{t("preferredLanguage")}</label>
            <select
              className="input"
              value={locale}
              onChange={(e) =>
                router.push(window.location.pathname, {
                  locale: e.target.value,
                })
              }
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={updateAccount.isPending}
          >
            {updateAccount.isPending ? (
              <Loader2 className="animate-spin" width={16} height={16} />
            ) : null}
            {t("saveChanges")}
          </button>
        </div>

        <div className="card pad">
          <h4
            style={{
              fontWeight: 800,
              color: "var(--olive)",
              fontSize: 13.5,
              marginBottom: 6,
            }}
          >
            {t("preferences")}
          </h4>

          <PreferenceToggle
            icon={Bell}
            title={t("apptReminder")}
            description={t("apptReminderDesc")}
            enabled={prefs.apptReminder}
            onToggle={() => handlePrefToggle("apptReminder")}
          />
          <PreferenceToggle
            icon={Package}
            title={t("orderUpdates")}
            description={t("orderUpdatesDesc")}
            enabled={prefs.orderUpdate}
            onToggle={() => handlePrefToggle("orderUpdate")}
          />
          <PreferenceToggle
            icon={Activity}
            title={t("vaccineReminder")}
            description={t("vaccineReminderDesc")}
            enabled={prefs.vaccineReminder}
            onToggle={() => handlePrefToggle("vaccineReminder")}
          />

          <div className="divider" />

          <button
            type="button"
            className="btn btn-danger-soft btn-block"
            onClick={handleLogout}
          >
            <LogOut width={15} height={15} strokeWidth={2} />
            {t("logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
