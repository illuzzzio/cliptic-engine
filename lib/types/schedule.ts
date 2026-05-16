export type SocialPlatform = "tiktok" | "instagram" | "youtube" | "twitter";

export type SocialAccount = {
  id: string;
  userId: string;
  platform: SocialPlatform;
  accountName: string;
  accountHandle: string;
  connectedAt: Date;
  expiresAt?: Date;
};

export type ScheduledPost = {
  id: string;
  userId: string;
  shortId: string;
  socialAccountId: string;
  scheduledDate: Date;
  status: "scheduled" | "posted" | "failed" | "canceled";
  postedAt?: Date;
  postUrl?: string;
  errorMessage?: string;
};

export type VideoClip = {
  id: string;
  title: string;
  duration: number;
  seoScore: number;
  exportUrl: string | null;
  renderStatus: string;
};
