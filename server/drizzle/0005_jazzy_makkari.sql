BEGIN;

ALTER TABLE IF EXISTS work_center DROP CONSTRAINT IF EXISTS work_center_cost_center_id_cost_center_id_fk;
ALTER TABLE IF EXISTS department DROP CONSTRAINT IF EXISTS department_plant_id_plant_id_fk;
ALTER TABLE IF EXISTS cost_center DROP CONSTRAINT IF EXISTS cost_center_plant_id_plant_id_fk;
ALTER TABLE IF EXISTS work_center DROP CONSTRAINT IF EXISTS work_center_plant_id_plant_id_fk;

CREATE SEQUENCE IF NOT EXISTS plant_id_serial_seq;
ALTER TABLE plant ADD COLUMN IF NOT EXISTS id_new integer;
ALTER TABLE plant ALTER COLUMN id_new SET DEFAULT nextval('plant_id_serial_seq');
UPDATE plant SET id_new = nextval('plant_id_serial_seq') WHERE id_new IS NULL;
SELECT setval('plant_id_serial_seq', COALESCE((SELECT MAX(id_new) FROM plant), 1), true);

ALTER TABLE department ADD COLUMN IF NOT EXISTS plant_id_new integer;
ALTER TABLE cost_center ADD COLUMN IF NOT EXISTS plant_id_new integer;
ALTER TABLE work_center ADD COLUMN IF NOT EXISTS plant_id_new integer;

UPDATE department d
SET plant_id_new = p.id_new
FROM plant p
WHERE d.plant_id IS NOT NULL AND d.plant_id = p.id;

UPDATE cost_center c
SET plant_id_new = p.id_new
FROM plant p
WHERE c.plant_id IS NOT NULL AND c.plant_id = p.id;

UPDATE work_center w
SET plant_id_new = p.id_new
FROM plant p
WHERE w.plant_id IS NOT NULL AND w.plant_id = p.id;

ALTER TABLE cost_center ADD COLUMN IF NOT EXISTS work_center_id integer;
UPDATE cost_center c
SET work_center_id = x.work_center_id
FROM (
  SELECT DISTINCT ON (cost_center_id) cost_center_id, id AS work_center_id
  FROM work_center
  WHERE cost_center_id IS NOT NULL
  ORDER BY cost_center_id, id DESC
) x
WHERE c.id = x.cost_center_id
  AND c.work_center_id IS NULL;

ALTER TABLE department
ALTER COLUMN dep_code TYPE numeric
USING CASE
  WHEN dep_code IS NULL OR btrim(dep_code) = '' THEN NULL
  WHEN btrim(dep_code) ~ '^-?[0-9]+(\.[0-9]+)?$' THEN dep_code::numeric
  ELSE NULL
END;

ALTER TABLE cost_center
ALTER COLUMN cost_center_code TYPE numeric
USING CASE
  WHEN cost_center_code IS NULL OR btrim(cost_center_code) = '' THEN NULL
  WHEN btrim(cost_center_code) ~ '^-?[0-9]+(\.[0-9]+)?$' THEN cost_center_code::numeric
  ELSE NULL
END;

ALTER TABLE work_center
ALTER COLUMN work_code TYPE numeric
USING CASE
  WHEN work_code IS NULL OR btrim(work_code) = '' THEN NULL
  WHEN btrim(work_code) ~ '^-?[0-9]+(\.[0-9]+)?$' THEN work_code::numeric
  ELSE NULL
END;

ALTER TABLE plant DROP CONSTRAINT IF EXISTS plant_pkey;
ALTER TABLE plant RENAME COLUMN id TO id_uuid;
ALTER TABLE plant RENAME COLUMN id_new TO id;
ALTER TABLE plant ADD CONSTRAINT plant_pkey PRIMARY KEY (id);
ALTER SEQUENCE plant_id_serial_seq OWNED BY plant.id;

ALTER TABLE department RENAME COLUMN plant_id TO plant_id_uuid;
ALTER TABLE department RENAME COLUMN plant_id_new TO plant_id;

ALTER TABLE cost_center RENAME COLUMN plant_id TO plant_id_uuid;
ALTER TABLE cost_center RENAME COLUMN plant_id_new TO plant_id;

ALTER TABLE work_center RENAME COLUMN plant_id TO plant_id_uuid;
ALTER TABLE work_center RENAME COLUMN plant_id_new TO plant_id;

ALTER TABLE work_center DROP COLUMN IF EXISTS cost_center_id;

ALTER TABLE department DROP COLUMN IF EXISTS plant_id_uuid;
ALTER TABLE cost_center DROP COLUMN IF EXISTS plant_id_uuid;
ALTER TABLE work_center DROP COLUMN IF EXISTS plant_id_uuid;
ALTER TABLE plant DROP COLUMN IF EXISTS id_uuid;

ALTER TABLE department
ADD CONSTRAINT department_plant_id_plant_id_fk
FOREIGN KEY (plant_id) REFERENCES plant(id) ON DELETE CASCADE;

ALTER TABLE cost_center
ADD CONSTRAINT cost_center_plant_id_plant_id_fk
FOREIGN KEY (plant_id) REFERENCES plant(id) ON DELETE CASCADE;

ALTER TABLE work_center
ADD CONSTRAINT work_center_plant_id_plant_id_fk
FOREIGN KEY (plant_id) REFERENCES plant(id) ON DELETE CASCADE;

ALTER TABLE cost_center
DROP CONSTRAINT IF EXISTS cost_center_work_center_id_work_center_id_fk;

ALTER TABLE cost_center
ADD CONSTRAINT cost_center_work_center_id_work_center_id_fk
FOREIGN KEY (work_center_id) REFERENCES work_center(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'plant_code_unique'
      AND conrelid = 'plant'::regclass
  ) THEN
    ALTER TABLE plant ADD CONSTRAINT plant_code_unique UNIQUE (code);
  END IF;
END $$;

COMMIT;
