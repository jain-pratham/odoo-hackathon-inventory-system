"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Boxes, 
  History, 
  Settings, 
  Package2,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  UserCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useProfileStore } from "@/store/profile.store";

// Updated navItems to support submenus based on your sketch
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { 
    name: "Operations", 
    icon: ClipboardList,
    submenu: [
      { name: "Receipts", href: "/receipts" },
      { name: "Deliveries", href: "/deliveries" },
      { name: "Transfers", href: "/transfers" },
      { name: "Adjustments", href: "/adjustments" },
    ]
  },
  { name: "Stock", href: "/products", icon: Boxes },
  { name: "Move History", href: "/move-history", icon: History },
  { 
    name: "Settings", 
    icon: Settings,
    submenu: [
      { name: "Warehouses", href: "/warehouses" },
      { name: "Locations", href: "/locations" },
    ]
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, fetchProfile, logout } = useProfileStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      void fetchProfile();
    }
  }, [fetchProfile, user]);

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CI";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Side: Logo & Navigation */}
          <div className="flex items-center gap-8">
            
            {/* Brand / Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white shadow-sm group-hover:bg-green-700 transition-colors">
                <Package2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-green-950 tracking-tight">
                Core<span className="text-green-600">Inv</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                
                // Check if this item (or any of its submenu items) is currently active
                const isActive = item.href 
                  ? pathname === item.href || pathname.startsWith(item.href + '/')
                  : item.submenu?.some(sub => pathname.startsWith(sub.href));

                // IF IT HAS A SUBMENU (Dropdown)
                if (item.submenu) {
                  return (
                    <div key={item.name} className="relative group">
                      <button
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-green-50 text-green-800 shadow-sm border border-green-200/60"
                            : "text-gray-500 hover:bg-gray-50 hover:text-green-700"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? "text-green-600" : "text-gray-400"}`} />
                        {item.name}
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 group-hover:rotate-180 ${isActive ? "text-green-600" : "text-gray-400"}`} />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full mt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                        <div className="py-2 bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col">
                          {item.submenu.map((sub) => {
                            const isSubActive = pathname.startsWith(sub.href);
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={`px-4 py-2 text-sm font-medium mx-1 rounded-md transition-colors ${
                                  isSubActive
                                    ? "bg-green-50 text-green-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                // IF IT'S A STANDARD LINK
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-green-50 text-green-800 shadow-sm border border-green-200/60"
                        : "text-gray-500 hover:bg-gray-50 hover:text-green-700"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-green-600" : "text-gray-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Search, Notifications, Profile */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Fake Search Bar */}
            <div className="hidden lg:flex items-center relative">
              <Search className="absolute left-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="w-64 h-9 pl-9 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <kbd className="hidden sm:inline-block rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-500">⌘</kbd>
                <kbd className="hidden sm:inline-block rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-500">K</kbd>
              </div>
            </div>

            {/* Notification Bell */}
            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            {/* Profile Avatar */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm shadow-md border border-white">
                  {initials}
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">{user?.name || "CoreInventory User"}</p>
                    <p className="text-xs text-gray-500">{user?.email || "Loading profile..."}</p>
                    <span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                      {user?.role || "staff"}
                    </span>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-green-700"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
}
