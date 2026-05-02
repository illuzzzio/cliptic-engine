"use client";

import React from "react";
import { ClipticLogo } from "./ClipticLogo";
import { ExternalLink, Code2, Play, Camera, Briefcase, ArrowUpRight } from "lucide-react";

const C = { red: "#E63946", pink: "#FF2D78", yellow: "#FFD60A", muted: "#6B6B6B", border: "#1a1a1a" };

const footerLinks = {
  Product:   ["Features", "Pricing", "Changelog", "Roadmap", "Status"],
  Company:   ["About", "Blog", "Careers", "Press", "Contact"],
  Resources: ["Documentation", "API Reference", "Tutorials", "Community", "Affiliate"],
  Legal:     ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
};

const socials = [
  { icon: Code2,        label: "GitHub",     href: "#" },
  { icon: Play,         label: "YouTube",    href: "#" },
  { icon: Camera,       label: "Instagram",  href: "#" },
  { icon: Briefcase,    label: "LinkedIn",   href: "#" },
  { icon: ExternalLink, label: "X / Twitter", href: "#" },
];

export function Footer() {
  return (
    <footer id="footer" role="contentinfo" className="relative"
      style={{ background: "#060606", borderTop: "1px solid #1a1a1a", zIndex: 1 }}>
      {/* Top tri-color gradient bar */}
      <div className="w-full h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${C.red} 25%, ${C.yellow} 50%, ${C.pink} 75%, transparent 100%)` }} />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <ClipticLogo size="sm" />
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: C.muted }}>
              The AI-powered engine that turns your long-form content into viral short-form gold. Built for creators who move fast.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none"
                  style={{ background: "#111111", border: "1px solid #2a2a2a", color: C.muted }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = C.pink; el.style.color = C.pink; el.style.background = "rgba(255,45,120,0.08)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "#2a2a2a"; el.style.color = C.muted; el.style.background = "#111111"; }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: "#F8F8F8" }}>{category}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors duration-200 group flex items-center gap-1 focus:outline-none"
                      style={{ color: C.muted }}
                      onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#F8F8F8")}
                      onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.muted)}>
                      {link}
                      <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px mb-8" style={{ background: "#1a1a1a" }} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#3a3a3a" }}>
            © {new Date().getFullYear()} Cliptic Engine. All rights reserved. Built with ❤️ for creators.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map(item => (
              <a key={item} href="#" className="text-xs transition-colors duration-200" style={{ color: "#3a3a3a" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.muted)}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#3a3a3a")}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
