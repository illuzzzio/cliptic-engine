CREATE TABLE IF NOT EXISTS "generated_shorts" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
  "user_id" text NOT NULL,
  "title" text NOT NULL,
  "start_time" double precision NOT NULL,
  "end_time" double precision NOT NULL,
  "duration" double precision NOT NULL,
  "reason" text NOT NULL,
  "seo_score" integer NOT NULL,
  "captions" jsonb NOT NULL,
  "order_index" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
