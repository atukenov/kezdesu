"use client";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { signOutUser } from "@/lib/firebase";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", label: "Home", icon: HiHome },
    { href: "/meetups", label: "My Meetups", icon: HiCalendar },
    { href: "/profile", label: "Profile", icon: HiUserCircle },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="font-bold text-xl text-blue-600 dark:text-blue-300"
          >
            Kezdesu
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <HiSun className="w-5 h-5 mr-1" />
              ) : (
                <HiMoon className="w-5 h-5 mr-1" />
              )}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-200 dark:hover:text-red-400 dark:hover:bg-red-900/30"
            >
              <HiLogout className="w-5 h-5 mr-1" />
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
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
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <HiLogout className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
