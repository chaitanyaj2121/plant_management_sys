const { numeric } = require("drizzle-orm/pg-core");
const { integer, pgTable, varchar, uuid } = require("drizzle-orm/pg-core");

const userSchema = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name").notNull(),
  des: varchar("des").notNull(),
  code: numeric("code").notNull(),
});

module.exports = { userSchema };
