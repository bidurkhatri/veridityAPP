import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, QrCode, Share, History, Settings } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const [location] = useLocation();
  const [language] = useState<Language>('en');
  const { t } = useTranslation(language);

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: t('nav.home'),
      testId: "tab-home"
    },
    {
      path: "/prove",
      icon: QrCode, 
      label: t('nav.prove'),
      testId: "tab-prove"
    },
    {
      path: "/share",
      icon: Share,
      label: t('nav.share'),
      testId: "tab-share"
    },
    {
      path: "/history",
      icon: History,
      label: t('nav.history'),
      testId: "tab-history"
    },
    {
      path: "/settings",
      icon: Settings,
      label: t('nav.settings'),
      testId: "tab-settings"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-alt border-t border-border apple-glass">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || 
            (item.path === "/prove" && location.startsWith("/generate")) ||
            (item.path === "/share" && location.startsWith("/verify"));
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center h-12 w-12 rounded-xl transition-all duration-200",
                "text-xs font-medium min-w-0 flex-1 px-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              data-testid={item.testId}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] leading-tight truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;