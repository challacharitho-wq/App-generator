"use client";

import { LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function MobileNavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("Dashboard") },
    { href: "/dashboard/config", icon: Settings, label: t("Config") },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-[60] lg:hidden floating-pill px-6 py-3 flex items-center justify-around bg-white/90">
      {links.map((link) => {
        const isSelected = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link key={link.href} href={link.href} className="flex flex-col items-center gap-1 group">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isSelected ? "orange-gradient shadow-lg shadow-orange-500/20 scale-110" : "text-muted-foreground group-hover:text-primary"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className={cn("text-[9px] font-black uppercase tracking-widest", isSelected ? "text-primary" : "text-muted-foreground")}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
