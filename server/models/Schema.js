const {
  numeric,
  integer,
  pgTable,
  varchar,
  uuid,
  serial,
  text,
  timestamp,
} = require("drizzle-orm/pg-core");
const { relations } = require("drizzle-orm");

const plantSchema = pgTable("plant", {
  id: uuid("id").primaryKey(),
  name: varchar("name").notNull(),
  des: varchar("des").notNull(),
  code: numeric("code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User table for authentication
const userSchema = pgTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Department table
const departmentSchema = pgTable("department", {
  id: serial("id").primaryKey(),
  plantId: uuid("plant_id").references(() => plantSchema.id, {
    onDelete: "cascade",
  }),
  depName: varchar("dep_name", { length: 255 }).notNull(),
  depCode: varchar("dep_code", { length: 255 }).unique(),
  depDescription: text("dep_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CostCenter table
const costCenterSchema = pgTable("cost_center", {
  id: serial("id").primaryKey(),
  plantId: uuid("plant_id").references(() => plantSchema.id, {
    onDelete: "cascade",
  }),
  depId: integer("dep_id").references(() => departmentSchema.id, {
    onDelete: "cascade",
  }),
  costCenterName: varchar("cost_center_name", { length: 255 }).notNull(),
  costCenterCode: varchar("cost_center_code", { length: 255 }).unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WorkCenter table
const workCenterSchema = pgTable("work_center", {
  id: serial("id").primaryKey(),
  plantId: uuid("plant_id").references(() => plantSchema.id, {
    onDelete: "cascade",
  }),
  depId: integer("dep_id").references(() => departmentSchema.id, {
    onDelete: "cascade",
  }),
  costCenterId: integer("cost_center_id").references(
    () => costCenterSchema.id,
    {
      onDelete: "set null",
    },
  ),
  workName: varchar("work_name", { length: 255 }).notNull(),
  workCode: varchar("work_code", { length: 255 }).unique(),
  workDescription: text("work_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
const plantRelations = relations(plantSchema, ({ many }) => ({
  departments: many(departmentSchema),
  costCenters: many(costCenterSchema),
  workCenters: many(workCenterSchema),
}));

const departmentRelations = relations(departmentSchema, ({ one, many }) => ({
  plant: one(plantSchema, {
    fields: [departmentSchema.plantId],
    references: [plantSchema.id],
  }),
  costCenters: many(costCenterSchema),
  workCenters: many(workCenterSchema),
}));

const costCenterRelations = relations(costCenterSchema, ({ one, many }) => ({
  plant: one(plantSchema, {
    fields: [costCenterSchema.plantId],
    references: [plantSchema.id],
  }),
  department: one(departmentSchema, {
    fields: [costCenterSchema.depId],
    references: [departmentSchema.id],
  }),
  workCenters: many(workCenterSchema),
}));

const workCenterRelations = relations(workCenterSchema, ({ one }) => ({
  plant: one(plantSchema, {
    fields: [workCenterSchema.plantId],
    references: [plantSchema.id],
  }),
  department: one(departmentSchema, {
    fields: [workCenterSchema.depId],
    references: [departmentSchema.id],
  }),
  costCenter: one(costCenterSchema, {
    fields: [workCenterSchema.costCenterId],
    references: [costCenterSchema.id],
  }),
}));

module.exports = {
  plantSchema,
  userSchema,
  departmentSchema,
  costCenterSchema,
  workCenterSchema,
  plantRelations,
  workCenterRelations,
  costCenterRelations,
  departmentRelations,
};
