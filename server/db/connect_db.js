const { pgTable, serial, text, varchar } = require("drizzle-orm/pg-core");
const { drizzle } = require("drizzle-orm/node-postgres");
const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "Devanta@123",
  database: "plat_info_db",
});

client
  .connect()
  .then(() => {
    console.log("DB Connected Successfully");
  })
  .catch((err) => {
    console.log("Error Occured", err);
  });

const db = drizzle(client);
module.exports = db;
