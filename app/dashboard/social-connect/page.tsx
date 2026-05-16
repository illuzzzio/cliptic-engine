"use client";

import React, { useState, useEffect } from "react";
import type { IconType } from "react-icons";
import {
  FaInstagram,
  FaDiscord,
  FaReddit,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
  FaTiktok,
  FaSnapchat
} from "react-icons/fa6";
import { getUserCredits } from "@/lib/actions/user.actions";


type Platform = {
  name: string;
  key: string;
  auth: string;
  supports: string;
  color: string;
  icon: IconType;
};

const platforms: Platform[] = [
  {
    name: "Instagram",
    key: "instagram",
    auth: "OAuth 2.0",
    supports: "Feed, stories, reels, carousels",
    color: "#E4405F",
    icon: FaInstagram,
  },
  {
    name: "Discord",
    key: "discord",
    auth: "OAuth 2.0 (Bot)",
    supports: "Messages, embeds, polls, forum posts",
    color: "#5865F2",
    icon: FaDiscord,
  },
  {
    name: "Reddit",
    key: "reddit",
    auth: "OAuth 2.0",
    supports: "Text, images, videos, links",
    color: "#FF4500",
    icon: FaReddit,
  },
  {
    name: "YouTube",
    key: "youtube",
    auth: "OAuth 2.0",
    supports: "Videos, shorts",
    color: "#FF0000",
    icon: FaYoutube,
  },
  {
    name: "Twitter / X",
    key: "twitter",
    auth: "OAuth 2.0",
    supports: "Text, images, videos, threads",
    color: "#FFFFFF",
    icon: FaXTwitter,
  },
  {
    name: "Facebook",
    key: "facebook",
    auth: "OAuth 2.0",
    supports: "Text, images, videos, reels",
    color: "#1877F2",
    icon: FaFacebook,
  },
  {
    name: "TikTok",
    key: "tiktok",
    auth: "OAuth 2.0",
    supports: "Videos",
    color: "#00F2EA",
    icon: FaTiktok,
  },
  {
    name: "Snapchat",
    key: "snapchat",
    auth: "OAuth 2.0",
    supports: "Stories, saved stories, spotlight",
    color: "#FFFC00",
    icon: FaSnapchat,
  },
];

export default function SocialConnectPage() {
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      console.log("Fetching accounts...");
      const profileId = localStorage.getItem("zernioProfileId");
      const url = profileId ? `/api/zernio/accounts?profileId=${profileId}` : "/api/zernio/accounts";
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok && data.accounts) {
        console.log("Found accounts:", data.accounts.length);
        setConnectedAccounts(data.accounts);
      }
    } catch (e) {
      console.error("Failed to fetch accounts:", e);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const fetchUserPlan = async () => {
    const data = await getUserCredits();
    if (data) setUserPlan(data.plan);
  };

  useEffect(() => {
    fetchAccounts();
    fetchUserPlan();
    
    // Check if we just returned from a connection flow
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("connected") === "true") {
        // Clean up URL without refreshing
        window.history.replaceState({}, document.title, "/dashboard/social-connect");
      }
    }
  }, []);

  const handleDisconnect = async (accountId: string, platformKey: string) => {
    if (!confirm(`Are you sure you want to disconnect this account?`)) return;
    
    setLoadingPlatform(platformKey);
    try {
      const res = await fetch(`/api/zernio/accounts?accountId=${accountId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAccounts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to disconnect");
      }
    } catch (err) {
      console.error(err);
      alert("Error disconnecting account");
    } finally {
      setLoadingPlatform(null);
    }
  };

  const handleConnect = async (platformKey: string) => {
    if (userPlan === "free" && platformKey !== "instagram" && platformKey !== "youtube") {
      alert("Free tier users can only connect to Instagram and YouTube. Please upgrade to the Cliptic Plan to unlock all platforms.");
      return;
    }
    setLoadingPlatform(platformKey);
    try {
      const cachedProfileId = localStorage.getItem("zernioProfileId");
      
      const res = await fetch("/api/zernio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformKey, profileId: cachedProfileId }),
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.profileId) {
          localStorage.setItem("zernioProfileId", data.profileId);
        }
        
        if (data.url) {
          // Standard redirect as requested. Zernio will handle the OAuth flow here.
          // Note: To return back, you MUST set the Redirect URI in Zernio Dashboard!
          window.location.href = data.url;
        } else {
          alert(data.message || `Connected to ${platformKey} successfully!`);
        }
      } else {
        alert(data.error || "Failed to connect");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while connecting.");
    } finally {
      setLoadingPlatform(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#B026FF] to-[#00E5FF] bg-clip-text text-transparent mb-2">
            Social Connect
          </h1>
          <p className="text-[#6B6B6B] text-sm">
            Connect and prepare every social platform supported by Zernio for scheduled publishing.
          </p>
        </div>
        <button
          onClick={fetchAccounts}
          disabled={isLoadingAccounts}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111111] border border-[#2a2a2a] text-xs font-bold text-[#F8F8F8] hover:border-[#B026FF]/40 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoadingAccounts ? (
            <span className="w-3 h-3 border-2 border-t-transparent border-[#B026FF] rounded-full animate-spin" />
          ) : (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {isLoadingAccounts ? "Syncing..." : "Sync Accounts"}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Supported Platforms", value: "8", color: "#B026FF" },
          { label: "Post Destinations", value: "All Major", color: "#00E5FF" },
          { label: "API Base", value: "Zernio", color: "#7000FF" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10"
              style={{ backgroundColor: stat.color }}
            />
            <p className="text-sm font-medium text-[#6B6B6B] mb-2">{stat.label}</p>
            <p className="text-3xl font-black" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const connectedAccount = connectedAccounts.find(acc => acc.platform.toLowerCase() === platform.key.toLowerCase());
          const isConnected = !!connectedAccount;

          return (
            <div
              key={platform.key}
              className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:border-[#B026FF]/40 hover:shadow-[0_0_30px_rgba(176,38,255,0.06)] hover:-translate-y-1"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-80"
                style={{ backgroundColor: platform.color }}
              />
              <div
                className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: platform.color }}
              />

              <div className="relative z-10 flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                  style={{
                    backgroundColor: `${platform.color}16`,
                    borderColor: `${platform.color}45`,
                    color: platform.color,
                  }}
                  aria-hidden="true"
                >
                  <Icon size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-[#F8F8F8] leading-tight">{platform.name}</h2>
                      <p className="mt-1 text-xs font-mono text-[#777]">{platform.key}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[#AFAFAF] leading-6">{platform.supports}</p>
                  
                  <div className="mt-6 border-t border-[#2a2a2a] pt-4">
                    {isConnected ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111111] border border-[#2a2a2a]">
                          {connectedAccount.profilePic ? (
                            <img 
                              src={connectedAccount.profilePic} 
                              alt="" 
                              className="w-10 h-10 rounded-full border border-[#2a2a2a]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs font-bold text-[#F8F8F8]">
                              {connectedAccount.accountName?.charAt(0) || "U"}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#F8F8F8] truncate">
                              {connectedAccount.accountName}
                            </p>
                            <p className="text-[10px] font-medium text-[#00E5FF] uppercase tracking-wider">
                              Connected
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDisconnect(connectedAccount.id, platform.key)}
                          disabled={loadingPlatform === platform.key}
                          className="w-full flex items-center justify-center py-2 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20 disabled:opacity-50"
                        >
                          Disconnect Account
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(platform.key)}
                        disabled={loadingPlatform === platform.key || isLoadingAccounts}
                        className="w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: `${platform.color}15`, 
                          color: platform.color,
                          border: `1px solid ${platform.color}30` 
                        }}
                      >
                        {loadingPlatform === platform.key ? "Connecting..." : "Connect Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
