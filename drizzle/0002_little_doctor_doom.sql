ALTER TABLE "comments" ALTER COLUMN "level" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "level" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "content" SET DATA TYPE varchar;