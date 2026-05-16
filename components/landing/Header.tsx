"use client";

import React, { useState, useEffect } from "react";
import { ClipticLogo } from "./ClipticLogo";
import { Menu, X } from "lucide-react";
import { UserButton, SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

const navLinks = [
  { href: "#features",    label: "Features"     },
  { href: "#how-it-works", label: "User Instructions" },
  { href: "#pricing",     label: "Pricing"      },
];

export function Header() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleNavClick = (href: string) => {
    setActiveLink(href);
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header id="header" role="banner" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(9,9,9,0.94)" : "rgba(9,9,9,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(176,38,255,0.15)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 30px rgba(176,38,255,0.07)" : "none",
      }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-lg" aria-label="Home">
          <ClipticLogo size="sm" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" role="navigation" aria-label="Main navigation">
          {navLinks.map(link => (
            <button key={link.href} onClick={() => handleNavClick(link.href)}
              className="relative text-sm font-medium transition-colors duration-200 focus:outline-none"
              style={{ color: activeLink === link.href ? "#F8F8F8" : "#6B6B6B" }}>
              {link.label}
              {activeLink === link.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg,#7000FF,#B026FF)" }} />
              )}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoaded ? null : !userId ? (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-medium transition-colors duration-200 focus:outline-none"
                  style={{ color: "#6B6B6B" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#F8F8F8")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B")}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button id="header-cta-btn"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  style={{ background: "linear-gradient(135deg,#7000FF,#B026FF)", boxShadow: "0 0 20px rgba(176,38,255,0.3)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 0 35px rgba(176,38,255,0.55)"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 0 20px rgba(176,38,255,0.3)"; el.style.transform = "translateY(0)"; }}>
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-[#F8F8F8] hover:text-[#B026FF] transition-colors mr-4">
                Dashboard
              </Link>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-lg border border-[#2a2a2a]",
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Hamburger */}
        <button id="mobile-menu-btn" className="md:hidden p-2 rounded-lg focus:outline-none"
          style={{ color: "#F8F8F8" }} onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{ background: "rgba(9,9,9,0.98)", borderTop: "1px solid #1a1a1a" }}>
          {navLinks.map(link => (
            <button key={link.href} onClick={() => handleNavClick(link.href)}
              className="text-left text-sm font-medium py-2 transition-colors duration-200" style={{ color: "#A0A0A0" }}>
              {link.label}
            </button>
          ))}
          {!isLoaded ? null : !userId ? (
            <SignUpButton mode="modal">
              <button className="mt-2 px-5 py-3 rounded-lg text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#7000FF,#B026FF)" }}>
                Get Started Free
              </button>
            </SignUpButton>
          ) : (
            <Link href="/dashboard" className="mt-2 px-5 py-3 rounded-lg text-sm font-semibold text-white text-center"
                style={{ background: "linear-gradient(135deg,#7000FF,#B026FF)" }}>
                Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
