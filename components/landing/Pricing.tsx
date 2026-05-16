"use client";

import React, { useState } from "react";
import { Check, Zap, Star, Building2, Loader2 } from "lucide-react";
import Script from "next/script";

const C = { deep: "#7000FF", electric: "#B026FF", cyan: "#00E5FF", dark: "#111111", border: "#2a2a2a", white: "#F8F8F8", muted: "#6B6B6B" };

const plans = [
  {
    id: "free", icon: Zap, name: "Free", tagline: "Perfect for getting started",
    price: { monthly: 0, yearly: 0 }, color: C.muted, borderColor: C.border,
    cta: "Get Started Free",
    ctaStyle: { background: "transparent", border: `1px solid ${C.border}`, color: C.white },
    features: ["30 Credits per month", "Up to 10-min source video", "720p export quality", "Basic auto captions", "Cliptic Watermark included", "Community support"],
    notIncluded: ["No Watermark", "Priority Processing", "Advanced AI Styles"],
  },
  {
    id: "cliptic", icon: Star, name: "Cliptic Plan", tagline: "For creators who mean business",
    price: { monthly: 499, yearly: 399 }, color: C.cyan, borderColor: C.cyan,
    popular: true,
    cta: "Upgrade to Cliptic",
    ctaStyle: { background: C.cyan, border: "none", color: "#090909" },
    features: ["250 Credits per month", "Up to 60-min source videos", "1080p export quality", "AI captions in 50+ languages", "No watermark", "Custom branding", "Priority processing", "Thumbnail generator", "Analytics dashboard"],
    notIncluded: ["API access"],
  },
  {
    id: "cliptic_pro", icon: Building2, name: "Cliptic Pro", tagline: "Scale your content engine",
    price: { monthly: 1499, yearly: 1199 }, color: C.electric, borderColor: C.electric,
    cta: "Get Pro Access",
    ctaStyle: { background: "transparent", border: `1px solid ${C.electric}`, color: C.electric },
    features: ["Unlimited Credits", "Up to 4-hour source video", "4K export quality", "Everything in Cliptic Plan", "White-label solution", "Dedicated account manager", "Advanced analytics"],
    notIncluded: [],
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: typeof plans[0]) => {
    const price = plan.price[billing];
    if (price === 0) {
      alert("Redirecting to your free account...");
      return;
    }

    setIsLoading(plan.id);

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, planId: plan.id }),
      });

      const order = await res.json();

      if (order.error) {
        throw new Error(order.error);
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", 
        amount: order.amount,
        currency: order.currency,
        name: "Cliptic Engine",
        description: `Subscription to ${plan.name} Plan`,
        order_id: order.id,
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: plan.color,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section id="pricing" aria-label="Pricing" className="relative py-24 px-6" style={{ zIndex: 1 }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Gradient divider top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${C.deep}, ${C.cyan}, ${C.electric}, transparent)` }} />

      <div className="text-center mb-12 max-w-2xl mx-auto">
        <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(112,0,255,0.1)", color: C.deep, border: "1px solid rgba(112,0,255,0.3)" }}>
          Pricing
        </span>
        <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight"
          style={{ color: C.white, letterSpacing: "-0.02em" }}>
          Simple,{" "}
          <span style={{ background: `linear-gradient(135deg,${C.electric},${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
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
                background: billing === b ? C.deep : "transparent",
                color: billing === b ? "#fff" : C.muted,
                boxShadow: billing === b ? `0 0 15px rgba(112,0,255,0.35)` : "none",
              }}>
              {b}
              {b === "yearly" && <span className="ml-2 text-xs font-bold" style={{ color: billing === "yearly" ? C.cyan : C.electric }}>-35%</span>}
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
                  style={{ background: C.cyan, color: "#090909" }}>Most Popular</div>
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
                  <span className="text-5xl font-black" style={{ color: plan.popular ? C.cyan : C.white, letterSpacing: "-0.04em" }}>
                    ₹{price}
                  </span>
                  {price > 0 && <span className="text-sm mb-2" style={{ color: C.muted }}>/mo</span>}
                </div>
                {billing === "yearly" && price > 0 && (
                  <div className="text-xs mt-1" style={{ color: C.muted }}>Billed annually</div>
                )}
              </div>

              <button id={`pricing-cta-${plan.id}`}
                disabled={isLoading === plan.id}
                onClick={() => handleCheckout(plan)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm mb-7 transition-all duration-300 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                style={plan.ctaStyle as React.CSSProperties}
                onMouseEnter={e => { if (plan.popular && isLoading !== plan.id) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 30px ${plan.color}50`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
                {isLoading === plan.id && <Loader2 size={16} className="animate-spin" />}
                {plan.cta}
              </button>

              <div className="mb-5 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${plan.color}30, transparent)` }} />

              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: C.electric }} />
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
