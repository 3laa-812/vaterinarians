"use client";

import { usePathname, useRouter } from "@/lib/i18n-navigation";
import { useTranslations } from "next-intl";
import { useGuardianCartStore } from "@/store/useGuardianCartStore";
import { useState, useEffect } from "react";
import { Home, Store, ShoppingCart, User, Plus } from "lucide-react";
import { motion } from "motion/react";
import { guardianTransitions } from "@/lib/guardian/motion";
import { isGuardianNavActive } from "@/lib/guardian/nav";

export function GuardianBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("guardian");
  const cartCount = useGuardianCartStore((s) => s.getItemCount());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (pathname.includes("/guardian/login")) return null;

  const links = [
    { key: "home", icon: Home, label: t("myDashboard"), path: "/guardian" },
    { key: "store", icon: Store, label: t("store"), path: "/guardian/store" },
    { key: "fab", isFab: true, path: "/guardian/appointments/new" },
    {
      key: "cart",
      icon: ShoppingCart,
      label: t("cart"),
      path: "/guardian/cart",
      badge: cartCount,
    },
    {
      key: "account",
      icon: User,
      label: t("account"),
      path: "/guardian/account",
    },
  ];

  return (
    <nav className="mnav">
      {links.map((link) => {
        if (link.isFab) {
          return (
            <button
              key={link.key}
              type="button"
              onClick={() => router.push(link.path)}
              className="mnav-fab"
              aria-label={t("book_appointment")}
            >
              <Plus strokeWidth={2.4} />
            </button>
          );
        }

        const isActive =
          link.path === "/guardian"
            ? pathname === "/guardian" || pathname.endsWith("/guardian")
            : isGuardianNavActive(pathname, {
                key: link.key,
                path: link.path!,
                labelKey: link.key,
                icon: link.icon!,
              });

        return (
          <button
            key={link.key}
            type="button"
            onClick={() => router.push(link.path!)}
            className={`mnav-item${isActive ? " active" : ""}`}
          >
            {isActive && (
              <motion.div
                layoutId="guardian-mnav-highlight"
                className="absolute inset-0 rounded-[14px] bg-[var(--sage-soft)]"
                style={{ zIndex: 0 }}
                transition={guardianTransitions.spring}
              />
            )}
            <div className="relative">
              {link.icon && <link.icon strokeWidth={isActive ? 2 : 1.8} />}
              {isMounted && !!link.badge && link.badge > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-[var(--vitality)] text-[8px] font-bold text-white px-1">
                  {link.badge}
                </span>
              )}
            </div>
            <span>{link.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
