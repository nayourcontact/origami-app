const crypto = require("crypto");
const Order = require("../models/Order");
const { sendConfirmationEmail } = require("./emailService");

function hashEmail(email) {
    return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

function encrypt(text) {
    const key = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex');
    const iv = Buffer.from(process.env.EMAIL_ENCRYPTION_IV, 'hex');

    if (key.length !== 32 || iv.length !== 16) {
        throw new Error("Encryption configuration invalid");
    }

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

exports.processOrder = async ({ name, email, details, notes }) => {
    const adminEmail = "galditakacsbertold@gmail.com";
    const subject = `Új megrendelés érkezett – ${new Date().toLocaleString("hu-HU")}`;

    const textContent = `
Új megrendelés érkezett az Origami Alfredo weboldalon:

A megrendelő neve: ${name}
A megrendelő email címe: ${email}

Részletek a megrendelésről:
${details}

Megjegyzés: ${notes || "–"}

Dátum: ${new Date().toLocaleString("hu-HU")}
`;

    const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; color: #333; background-color: #f9f9f9; padding: 2rem; border-radius: 10px; max-width: 600px; margin: auto;">
      <h2 style="color: #0051cb; border-bottom: 2px solid #0051cb; padding-bottom: 0.5rem;">Új megrendelés érkezett</h2>

      <p style="font-size: 16px; margin: 1rem 0;"><strong>A megrendelő neve:</strong><br/>${name}</p>

      <p style="font-size: 16px; margin: 1rem 0;"><strong>A megrendelő email címe:</strong><br/><a href="mailto:${email}" style="color: #0051cb;">${email}</a></p>

      <p style="font-size: 16px; margin: 1rem 0;"><strong>Részletek a megrendelésről:</strong><br/>${details.replace(/\n/g, "<br/>")}</p>

      <p style="font-size: 16px; margin: 1rem 0;"><strong>Megjegyzés:</strong><br/>${notes ? notes.replace(/\n/g, "<br/>") : "–"}</p>

      <hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;" />

      <p style="font-size: 12px; color: #888; text-align: right;">Küldve: ${new Date().toLocaleString("hu-HU")}</p>
    </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: adminEmail,
        replyTo: email,
        subject,
        text: textContent,
        html: htmlContent,
    };

    const transporter = require("nodemailer").createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[ORDER EMAIL]: Order sent successfully from: ${email}`);
    } catch (err) {
        console.error(`[ORDER EMAIL ERROR]: ${err.message}`);
        throw new Error("Failed to send order email.");
    }

    try {
        const emailHash = hashEmail(email);
        const encryptedEmail = encrypt(email);
        const encryptedName = encrypt(name);

        const order = new Order({
            encryptedName,
            encryptedEmail,
            emailHash,
            details,
            notes
        });

        await order.save();
        console.log(`[ORDER]: Order saved to DB for ${email}`);
    } catch (err) {
        console.error(`[ORDER DB ERROR]: ${err.message}`);
        throw new Error("Failed to save order.");
    }
};

exports.getAllOrders = async () => {
    return await Order.find({}).lean();
};