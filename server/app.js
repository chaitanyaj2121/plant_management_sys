const express = require("express");
require("dotenv").config();

const plantRoutes = require("./routes/plantRoutes");

const app = express();
app.use(express.json());

app.use("/api/plants", plantRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
