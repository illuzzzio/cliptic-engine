import { doublePrecision, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
