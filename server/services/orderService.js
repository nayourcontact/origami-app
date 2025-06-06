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

    try {
        const transporter = require("nodemailer").createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail(mailOptions);
        console.log(`[ORDER EMAIL]: Order sent successfully from: ${email}`);
    } catch (err) {
        console.error(`[ORDER EMAIL ERROR]: ${err.message}`);
        const error = new Error("Failed to send order confirmation email.");
        error.statusCode = 500;
        throw error;
    }
};
