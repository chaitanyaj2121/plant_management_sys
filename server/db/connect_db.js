const { drizzle } = require("drizzle-orm/node-postgres");
const { Client } = require("pg");
const schema = require("../models/Schema");

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

const db = drizzle(client, { schema });
module.exports = db;
