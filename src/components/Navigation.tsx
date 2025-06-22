"use client";
import { useAuth } from "@/components/AuthProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/components/ThemeProvider";
import { signOutUser } from "@/lib/firebase";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HiCalendar,
  HiHome,
  HiLogout,
  HiMenu,
  HiMoon,
  HiSun,
  HiUserCircle,
  HiX,
} from "react-icons/hi";

const Navigation = () => {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", label: t("recentMeetups"), icon: HiHome },
    { href: "/meetups", label: t("myMeetups"), icon: HiCalendar },
    { href: "/profile", label: t("profile"), icon: HiUserCircle },
  ];

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background shadow-lg transition-colors border-b border-foreground-accent">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center font-bold text-xl text-primary gap-2"
          >
            <img
              src="/images/logo.png"
              alt="Kezdesu Logo"
              className="h-12 w-12 object-contain"
            />
            <span
              style={{
                fontFamily: "var(--font-title)",
                fontWeight: 500,
                fontSize: "1.3rem",
              }}
            >
              Kezdesu
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-primary bg-secondary"
                    : "text-foreground hover:text-primary hover:bg-secondary dark:text-foreground dark:hover:text-primary dark:hover:bg-secondary"
                }`}
              >
                <item.icon className="w-5 h-5 mr-1" />
                {item.label}
              </Link>
            ))}
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-primary hover:bg-secondary transition-colors"
              aria-label={t("theme")}
            >
              {theme === "dark" ? (
                <HiSun className="w-5 h-5 mr-1" />
              ) : (
                <HiMoon className="w-5 h-5 mr-1" />
              )}
              {theme === "dark" ? t("light") : t("dark")}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <HiLogout className="w-5 h-5 mr-1" />
              {t("signOut")}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none focus:ring-2 focus:ring-primary rounded text-foreground dark:text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
          >
            {isMenuOpen ? (
              <HiX className="h-6 w-6" />
            ) : (
              <HiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            {/* Language and dark mode controls at the top, separated visually */}
            <div className="flex flex-col gap-2 px-2 pt-4 pb-2 border-b border-foreground-accent mb-2 bg-background">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-secondary transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <HiSun className="w-5 h-5 mr-2" />
                ) : (
                  <HiMoon className="w-5 h-5 mr-2" />
                )}
                {theme === "dark" ? t("light") : t("dark")}
              </button>
            </div>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === item.href
                      ? "text-primary bg-secondary"
                      : "text-foreground hover:text-primary hover:bg-secondary"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                <HiLogout className="w-5 h-5 mr-2" />
                {t("signOut")}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
