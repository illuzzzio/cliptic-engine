import { doublePrecision, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  plan: text("plan").default("free"), // free, cliptic, cliptic_pro
  credits: integer("credits").default(30),
  lastRenewalAt: timestamp("last_renewal_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(), // Generated NanoID or UUID
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("uploading"), // uploading, processing, completed, failed
  progress: text("progress").notNull().default("0"), // percentage
  videoKey: text('video_key'),
  videoUrl: text('video_url'),
  transcript: text('transcript'),
  captions: jsonb('captions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const generatedShorts = pgTable("generated_shorts", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  startTime: doublePrecision("start_time").notNull(),
  endTime: doublePrecision("end_time").notNull(),
  duration: doublePrecision("duration").notNull(),
  reason: text("reason").notNull(),
  seoScore: integer("seo_score").notNull(),
  captions: jsonb("captions").notNull(),
  captionStyleKey: text("caption_style_key").default("highlight-first-word"),
  captionFontFamily: text("caption_font_family").default("Inter, sans-serif"),
  captionSize: doublePrecision("caption_size").default(4.5),
  orderIndex: integer("order_index").notNull(),
  exportUrl: text("export_url"),
  renderId: text("render_id"),
  renderBucketName: text("render_bucket_name"),
  renderStatus: text("render_status").default("idle"),
  renderProgress: doublePrecision("render_progress").default(0),
  renderError: text("render_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialMediaAccounts = pgTable("social_media_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  accountName: text("account_name").notNull(),
  accountHandle: text("account_handle"),
  profilePic: text("profile_pic"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scheduledPosts = pgTable("scheduled_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shortId: text("short_id").notNull().references(() => generatedShorts.id, { onDelete: "cascade" }),
  socialAccountId: text("social_account_id").notNull().references(() => socialMediaAccounts.id, { onDelete: "cascade" }),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull().default("scheduled"),
  postedAt: timestamp("posted_at"),
  postUrl: text("post_url"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedbacks = pgTable("feedbacks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
