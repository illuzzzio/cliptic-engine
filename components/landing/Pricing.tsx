"use client";

import React, { useState } from "react";
import { Check, Zap, Star, Building2 } from "lucide-react";

const C = { red: "#E63946", pink: "#FF2D78", yellow: "#FFD60A", dark: "#111111", border: "#2a2a2a", white: "#F8F8F8", muted: "#6B6B6B" };

const plans = [
  {
    id: "free", icon: Zap, name: "Free", tagline: "Perfect for getting started",
    price: { monthly: 0, yearly: 0 }, color: C.muted, borderColor: C.border,
    cta: "Get Started Free",
    ctaStyle: { background: "transparent", border: `1px solid ${C.border}`, color: C.white },
    features: ["3 shorts per month", "Up to 30-min source video", "720p export quality", "Basic auto captions", "Watermark included", "Community support"],
    notIncluded: ["Custom branding", "Batch processing", "API access"],
  },
  {
    id: "pro", icon: Star, name: "Pro", tagline: "For creators who mean business",
    price: { monthly: 29, yearly: 19 }, color: C.yellow, borderColor: C.yellow,
    popular: true,
    cta: "Start Pro Trial",
    ctaStyle: { background: C.yellow, border: "none", color: "#090909" },
    features: ["Unlimited shorts", "Up to 4-hour source videos", "4K export quality", "AI captions in 50+ languages", "No watermark", "Custom branding", "Priority processing", "Thumbnail generator", "Analytics dashboard"],
    notIncluded: ["API access"],
  },
  {
    id: "enterprise", icon: Building2, name: "Enterprise", tagline: "Scale with your team",
    price: { monthly: 99, yearly: 79 }, color: C.pink, borderColor: C.pink,
    cta: "Contact Sales",
    ctaStyle: { background: "transparent", border: `1px solid ${C.pink}`, color: C.pink },
    features: ["Everything in Pro", "Unlimited team members", "API access & webhooks", "White-label solution", "SLA guarantee", "Dedicated account manager", "Custom AI model training", "SSO / SAML support", "Advanced analytics"],
    notIncluded: [],
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" aria-label="Pricing" className="relative py-24 px-6" style={{ zIndex: 1 }}>
      {/* Gradient divider top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${C.red}, ${C.yellow}, ${C.pink}, transparent)` }} />

      <div className="text-center mb-12 max-w-2xl mx-auto">
        <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(230,57,70,0.1)", color: C.red, border: "1px solid rgba(230,57,70,0.3)" }}>
          Pricing
        </span>
        <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight"
          style={{ color: C.white, letterSpacing: "-0.02em" }}>
          Simple,{" "}
          <span style={{ background: `linear-gradient(135deg,${C.pink},${C.yellow})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Transparent
          </span>{" "}
          Pricing
        </h2>
        <p className="text-base mb-8" style={{ color: C.muted }}>
          Start free, upgrade when you grow. No hidden fees, cancel anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
          {(["monthly", "yearly"] as const).map(b => (
            <button key={b} id={`billing-toggle-${b}`} onClick={() => setBilling(b)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize"
              style={{
                background: billing === b ? C.red : "transparent",
                color: billing === b ? "#fff" : C.muted,
                boxShadow: billing === b ? `0 0 15px rgba(230,57,70,0.35)` : "none",
              }}>
              {b}
              {b === "yearly" && <span className="ml-2 text-xs font-bold" style={{ color: billing === "yearly" ? C.yellow : C.pink }}>-35%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = plan.price[billing];
          return (
            <div key={plan.id} id={`pricing-card-${plan.id}`}
              className="relative rounded-2xl p-7 transition-all duration-300"
              style={{
                background: plan.popular ? "linear-gradient(135deg,#180010,#110007)" : C.dark,
                border: `1px solid ${plan.borderColor}${plan.popular ? "90" : "40"}`,
                boxShadow: plan.popular ? `0 0 40px ${plan.color}22, 0 20px 60px rgba(0,0,0,0.6)` : "none",
                transform: plan.popular ? "scale(1.03)" : "scale(1)",
              }}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                  style={{ background: C.yellow, color: "#090909" }}>Most Popular</div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}>
                  <Icon size={20} style={{ color: plan.color }} />
                </div>
                <div>
                  <div className="font-black text-lg" style={{ color: C.white }}>{plan.name}</div>
                  <div className="text-xs" style={{ color: C.muted }}>{plan.tagline}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black" style={{ color: plan.popular ? C.yellow : C.white, letterSpacing: "-0.04em" }}>
                    ${price}
                  </span>
                  {price > 0 && <span className="text-sm mb-2" style={{ color: C.muted }}>/mo</span>}
                </div>
                {billing === "yearly" && price > 0 && (
                  <div className="text-xs mt-1" style={{ color: C.muted }}>Billed annually</div>
                )}
              </div>

              <button id={`pricing-cta-${plan.id}`}
                className="w-full py-3 rounded-xl font-bold text-sm mb-7 transition-all duration-300 focus:outline-none"
                style={plan.ctaStyle as React.CSSProperties}
                onMouseEnter={e => { if (plan.popular) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 30px ${plan.color}50`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
                {plan.cta}
              </button>

              <div className="mb-5 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${plan.color}30, transparent)` }} />

              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: C.pink }} />
                    <span style={{ color: "#A0A0A0" }}>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm opacity-30">
                    <span className="mt-0.5 flex-shrink-0 text-center leading-[15px]" style={{ color: C.muted }}>×</span>
                    <span style={{ color: C.muted, textDecoration: "line-through" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-center mt-10 text-xs" style={{ color: "#3a3a3a" }}>
        All plans include 7-day free trial. No credit card required for Free plan.
      </p>
    </section>
  );
}
