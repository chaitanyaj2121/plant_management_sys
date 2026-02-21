const {
  numeric,
  integer,
  pgTable,
  varchar,
  serial,
  text,
  timestamp,
} = require("drizzle-orm/pg-core");
const { relations } = require("drizzle-orm");

const plantSchema = pgTable("plant", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  des: varchar("des").notNull(),
  code: numeric("code").notNull().unique(),
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
  plantId: integer("plant_id").references(() => plantSchema.id, {
    onDelete: "cascade",
  }),
  depName: varchar("dep_name", { length: 255 }).notNull(),
  depCode: numeric("dep_code").unique(),
  depDescription: text("dep_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CostCenter table
const costCenterSchema = pgTable("cost_center", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").references(() => plantSchema.id, {
    onDelete: "cascade",
  }),
  depId: integer("dep_id").references(() => departmentSchema.id, {
    onDelete: "cascade",
  }),
  workCenterId: integer("work_center_id"),
  costCenterName: varchar("cost_center_name", { length: 255 }).notNull(),
  costCenterCode: numeric("cost_center_code").unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WorkCenter table
const workCenterSchema = pgTable("work_center", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").references(() => plantSchema.id, {
    onDelete: "cascade",
  }),
  depId: integer("dep_id").references(() => departmentSchema.id, {
    onDelete: "cascade",
  }),
  workName: varchar("work_name", { length: 255 }).notNull(),
  workCode: numeric("work_code").unique(),
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
  workCenter: one(workCenterSchema, {
    fields: [costCenterSchema.workCenterId],
    references: [workCenterSchema.id],
  }),
}));

const workCenterRelations = relations(workCenterSchema, ({ one, many }) => ({
  plant: one(plantSchema, {
    fields: [workCenterSchema.plantId],
    references: [plantSchema.id],
  }),
  department: one(departmentSchema, {
    fields: [workCenterSchema.depId],
    references: [departmentSchema.id],
  }),
  costCenters: many(costCenterSchema),
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
