const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

let ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

const refreshInstagramToken = async (req, res = null) => {
    try {
        const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${ACCESS_TOKEN}`;
        const response = await axios.get(url);

        const newToken = response.data.access_token;
        const expiresIn = response.data.expires_in;

        fs.writeFileSync(".token", newToken); // token mentés
        ACCESS_TOKEN = newToken;

        console.log("Token frissítve:", newToken.slice(0, 20) + "...");
        console.log("Érvényes még ennyi másodpercig:", expiresIn);

        if (res) {
            res.json({
                message: "Token sikeresen frissítve",
                access_token: newToken,
                expires_in: expiresIn,
            });
        }
    } catch (error) {
        console.error("Token frissítési hiba:", error.response?.data || error.message);
        if (res) {
            res.status(500).json({ error: "Token frissítés sikertelen." });
        }
    }
};

module.exports = { refreshInstagramToken };
