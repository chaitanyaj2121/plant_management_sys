ALTER TABLE "plant"
ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;

ALTER TABLE "plant"
ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

ALTER TABLE "department"
ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;

ALTER TABLE "department"
ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;


ALTER TABLE "cost_center"
ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;

ALTER TABLE "cost_center"
ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;


ALTER TABLE "work_center"
ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;

ALTER TABLE "work_center"
ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;