import { Link, useLocation } from "wouter";
import { Home, Shield, Share, History, Settings } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const [location] = useLocation();
  const { t } = useTranslation('en');

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: t('nav.home'),
      testId: "tab-home"
    },
    {
      path: "/prove",
      icon: Shield, 
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

  // Don't show on customer portal or other dedicated portal pages as they have their own navigation
  const isPortalPage = location.includes('-portal');
  if (isPortalPage) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border"
      style={{ 
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        height: '64px'
      }}
      role="tablist"
      aria-label="Primary navigation"
    >
      <div className="grid grid-cols-5 h-full px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || 
            (item.path === "/prove" && location.startsWith("/generate")) ||
            (item.path === "/share" && location.startsWith("/verify"));
          
          return (
            <Link
              key={item.path}
              href={item.path}
              role="tab"
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-1 rounded-xl",
                "min-h-[44px] min-w-[44px] transition-colors duration-200",
                isActive 
                  ? "text-brand-primary" 
                  : "text-text-muted hover:text-text-primary"
              )}
              data-testid={item.testId}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium leading-none">
                {item.label}
              </span>
              <div className={cn(
                "mt-1 h-0.5 w-6 rounded-full transition-colors",
                isActive ? "bg-primary-600" : "bg-transparent"
              )} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;