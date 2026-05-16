import React from "react";
import { Pricing } from "@/components/landing/Pricing";

export default function DashboardPricingPage() {
  return (
    <div className="w-full max-w-7xl mx-auto py-6">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-black bg-gradient-to-r from-[#B026FF] to-[#00E5FF] bg-clip-text text-transparent mb-2">
          Upgrade Your Plan
        </h1>
        <p className="text-[#6B6B6B] text-sm">
          Get more features and remove limits to supercharge your content creation.
        </p>
      </div>
      
      <div className="-mt-16">
        <Pricing />
      </div>
    </div>
  );
}
