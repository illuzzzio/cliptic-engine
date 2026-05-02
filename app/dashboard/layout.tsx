"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, Calendar, CreditCard, Settings, Menu, X, ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ClipticLogo } from "@/components/landing/ClipticLogo";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "My Videos", href: "/dashboard/videos", icon: Video },
  { name: "Schedule Post", href: "/dashboard/schedule", icon: Calendar },
  { name: "Pricing", href: "/dashboard/pricing", icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <ClipticLogo size="sm" showEngine={true} />
        </Link>
        <button className="md:hidden text-[#6B6B6B]" onClick={() => setMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 px-4 mt-6">
        <div className="text-xs font-black uppercase tracking-widest text-[#3a3a3a] mb-4 px-2">Menu</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-[#B026FF]/10 text-[#B026FF] shadow-[0_0_15px_rgba(176,38,255,0.05)]"
                    : "text-[#6B6B6B] hover:bg-[#111111] hover:text-[#F8F8F8]"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-200 ${isActive ? "text-[#B026FF]" : "group-hover:scale-110"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t border-[#1a1a1a] bg-gradient-to-t from-[#050505] to-transparent">
        <div className="flex items-center justify-between bg-[#111111] border border-[#2a2a2a] rounded-xl p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-lg border border-[#2a2a2a]",
                  userButtonPopoverCard: "shadow-2xl border border-[#2a2a2a] bg-[#111111]",
                }
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#F8F8F8]">Account</span>
              <span className="text-xs text-[#6B6B6B]">Pro Plan</span>
            </div>
          </div>
          <Link href="/dashboard/settings" className="p-2 text-[#6B6B6B] hover:text-[#F8F8F8] hover:bg-[#1a1a1a] rounded-lg transition-colors">
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#090909] text-[#F8F8F8] flex relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#B026FF]/[0.02] to-transparent pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-[#1a1a1a] bg-[#090909] z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="w-[260px] max-w-[80%] bg-[#090909] border-r border-[#1a1a1a] h-full flex flex-col relative z-50 transform transition-transform duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#090909]">
          <Link href="/">
            <ClipticLogo size="sm" showEngine={false} />
          </Link>
          <button className="text-[#F8F8F8] p-2 bg-[#111111] rounded-lg border border-[#2a2a2a]" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
