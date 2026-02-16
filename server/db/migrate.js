const { migrate } = require("drizzle-orm/postgres-js/migrator");
const db = require("./connect_db");

async function migrateData() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration successful");
  process.exit(0);
}

migrateData().catch((err) => {
  console.log("Error Occurred ", err);
  process.exit(1);
});
