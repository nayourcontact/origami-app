const jwt = require("jsonwebtoken");
const adminService = require("../services/adminService");
const fs = require("fs");
const path = require("path");
const instagramTokenService = require("../services/instagramTokenService");

const localesPath = path.join(__dirname, "../../client/src/locales");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const login = async (req, res) => {
    const { email, password } = req.body;
    const admin = await adminService.findByEmail(email);

    if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({ message: "Hibás bejelentkezési adatok." });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
        expiresIn: "1d"
    });

    res.json({ token, role: admin.role });
};

const register = async (req, res) => {
    const { email, password } = req.body;
    const existingAdmins = await adminService.countAdmins();

    if (existingAdmins > 0 && (!req.user || req.user.role !== "admin")) {
        return res.status(403).json({ message: "Csak hitelesített admin regisztrálhat új adminokat." });
    }

    const exists = await adminService.findByEmail(email);
    if (exists) {
        return res.status(400).json({ message: "Ez az email már használatban van." });
    }

    const admin = await adminService.createAdmin(email, password);
    res.status(201).json({ message: "Admin sikeresen létrehozva.", id: admin._id });
};

const updateEmail = async (req, res) => {
    const { newEmail } = req.body;
    const adminId = req.user.id;

    const updated = await adminService.updateEmail(adminId, newEmail);
    res.json({ message: "Email frissítve", email: updated.email });
};

const statusCheck = async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ message: "userId paraméter szükséges" });
        }

        const validation = await instagramTokenService.validateToken(userId);

        const tokenData = await instagramTokenService.getTokenByUserId(userId);
        if (!tokenData) {
            return res.status(404).json({ message: "Token nem található" });
        }

        res.json({
            api: !!validation.valid,
            users: 5,
            jobs: 2,
            tokenInfo: {
                ...validation,
                token: tokenData.token,
                clientSecret: tokenData.clientSecret,
                expiresAt: tokenData.expiresAt,
                updatedAt: tokenData.updatedAt
            }
        });
    } catch (err) {
        console.error("Status check error:", err);
        res.status(500).json({
            message: "A státusz lekérése nem sikerült.",
            error: err.message
        });
    }
};

const getLanguageFile = async (req, res) => {
    const locale = req.params.locale;
    try {
        const filePath = path.join(localesPath, `${locale}.json`);
        const data = fs.readFileSync(filePath, "utf-8");
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ message: "Nem sikerült betölteni a nyelvi fájlt." });
    }
};

const saveLanguageFile = async (req, res) => {
    const locale = req.params.locale;
    const content = req.body;

    try {
        const filePath = path.join(localesPath, `${locale}.json`);
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
        res.json({ message: `A ${locale} nyelvi fájl mentve.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Nem sikerült menteni a nyelvi fájlt." });
    }
};

module.exports = {
    login,
    register,
    updateEmail,
    statusCheck,
    getLanguageFile,
    saveLanguageFile
};
