const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
require("dotenv").config();

const instagramRoutes = require("./routes/instagramTokenRoutes");
const biographyRoutes = require("./routes/biographyRoutes");
const postsRoutes = require("./routes/postRoutes");

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api", instagramRoutes);
app.use("/api/biography", biographyRoutes);
app.use('/api/posts', postsRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB error:', err));
