CREATE TABLE "plant" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"des" varchar NOT NULL,
	"code" numeric NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;