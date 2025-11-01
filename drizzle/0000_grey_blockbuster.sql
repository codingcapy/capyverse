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
