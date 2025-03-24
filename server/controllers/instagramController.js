const axios = require('axios');
require('dotenv').config();

let ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
let USER_ID = process.env.USER_ID;

const getInstagramProfile = async (req, res) => {
    try {
        const url = `https://graph.instagram.com/${USER_ID}?fields=id,username,biography&access_token=${ACCESS_TOKEN}`;
        const response = await axios.get(url);
        console.log('Instagram profil adat:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Instagram API hiba:', error.response?.data || error.message);
        res.status(500).json({error: 'Nem sikerült lekérni az adatokat az Instagram API-tól.'});
    }
};

module.exports = {getInstagramProfile};