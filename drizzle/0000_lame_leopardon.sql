CREATE TABLE "posts" (
	"post_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"community_id" varchar,
	"title" varchar NOT NULL,
	"content" varchar NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_content_unique" UNIQUE("content")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"username" varchar,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"preference" varchar DEFAULT 'light' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"vote_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"post_id" integer NOT NULL,
	"value" integer,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
