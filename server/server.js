const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Statikus fájlok kiszolgálása a Vue buildből
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// API endpoint például
// app.use('/api', require('./routes/yourRoutes'));

// Fallback minden másra: index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Szerver indítása
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Szerver fut a http://localhost:${PORT} címen`);
});
