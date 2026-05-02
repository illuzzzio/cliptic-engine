import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
  videoKey: text("video_key"), // S3 object key
  videoUrl: text("video_url"), // Signed URL
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
