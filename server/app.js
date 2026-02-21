const express = require("express");
require("dotenv").config();
const cors = require("cors");

const plantRoutes = require("./routes/plantRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const costCenterRoutes = require("./routes/costCenterRoutes");
const workCenterRoutes = require("./routes/workCenterRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/plants", plantRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/cost-centers", costCenterRoutes);
app.use("/api/work-centers", workCenterRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
