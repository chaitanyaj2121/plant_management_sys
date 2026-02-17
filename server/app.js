const express = require("express");
require("dotenv").config();

const db = require("./db/connect_db");
const { plantSchema } = require("./db/Schema");
const { v4: uuidv4 } = require("uuid");
const { eq } = require("drizzle-orm");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/get_plats", async (req, res) => {
  try {
    const result = await db.select().from(plantSchema);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.send("Error Occured", err);
  }
});

app.post("/create_plant", async (req, res, next) => {
  let id = uuidv4();
  await db.insert(plantSchema).values({
    id,
    name: req.body.name,
    des: req.body.des,
    code: req.body.code,
  });
  // let [user] = await db.select().from(userSchema).where(eq(userSchema.id, id));
  // res.send(user);
  res.send("Plant added successfully");
});

app.put("/update_plant/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .update(plantSchema)
      .set({
        name: req.body.name,
        des: req.body.des,
        code: req.body.code,
      })
      .where(eq(plantSchema.id, id));

    res.send("Plant updated successfully");
  } catch (err) {
    console.log(err);
    res.send("Error occurred while updating");
  }
});

app.delete("/delete_plant/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(userSchema).where(eq(plantSchema.id, id));

    res.send("Plant deleted successfully");
  } catch (err) {
    console.log(err);
    res.send("Error occurred while deleting");
  }
});

app.listen(PORT, () => {
  console.log(`App is listening on the port :${PORT}`);
});
