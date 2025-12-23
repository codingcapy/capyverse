CREATE TABLE "images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"post_id" integer,
	"user_id" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"posted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_comments" (
	"saved_comment_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"comment_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_posts" (
	"saved_post_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_content_unique";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "parent_comment_id" integer;