/** @type {import("drizzle-kit").Config} */
module.exports = {
  schema: "./models/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:password@localhost:5432/plat_info_db",
  },
};
