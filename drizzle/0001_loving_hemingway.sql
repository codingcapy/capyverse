CREATE TABLE "comments" (
	"comment_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" integer NOT NULL,
	"level" integer,
	"content" integer,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "comment_id" integer;