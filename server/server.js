const express = require("express");
const cors = require("cors");
require("dotenv").config();

const instagramRoutes = require("./routes/instagramRoutes");
const refreshRoutes = require("./routes/refreshRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use("/api", instagramRoutes);
app.use("/api", refreshRoutes);

app.listen(PORT, () => {
    console.log(`Szerver fut a http://localhost:${PORT} címen`);
});
