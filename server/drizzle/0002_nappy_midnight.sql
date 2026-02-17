CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" uuid,
	"dep_name" varchar(255) NOT NULL,
	"dep_code" varchar(255),
	"dep_description" text,
	CONSTRAINT "department_dep_code_unique" UNIQUE("dep_code")
);
--> statement-breakpoint
CREATE TABLE "cost_center" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" uuid,
	"dep_id" integer,
	"cost_center_name" varchar(255) NOT NULL,
	"cost_center_code" varchar(255),
	"description" text,
	CONSTRAINT "cost_center_cost_center_code_unique" UNIQUE("cost_center_code")
);
--> statement-breakpoint
CREATE TABLE "work_center" (
	"id" serial PRIMARY KEY NOT NULL,
	"plant_id" uuid,
	"dep_id" integer,
	"cost_center_id" integer,
	"work_name" varchar(255) NOT NULL,
	"work_code" varchar(255),
	"work_description" text,
	CONSTRAINT "work_center_work_code_unique" UNIQUE("work_code")
);
--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_plant_id_plant_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_center" ADD CONSTRAINT "cost_center_plant_id_plant_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_center" ADD CONSTRAINT "cost_center_dep_id_department_id_fk" FOREIGN KEY ("dep_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_center" ADD CONSTRAINT "work_center_plant_id_plant_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_center" ADD CONSTRAINT "work_center_dep_id_department_id_fk" FOREIGN KEY ("dep_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_center" ADD CONSTRAINT "work_center_cost_center_id_cost_center_id_fk" FOREIGN KEY ("cost_center_id") REFERENCES "public"."cost_center"("id") ON DELETE set null ON UPDATE no action;