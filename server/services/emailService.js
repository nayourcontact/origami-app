const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const adminEmail = "alfred.takacs92@gmail.com";

/**
 * Egységes HTML sablon wrap
 */
function wrapInTemplate(title, body) {
    return `
<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>
  <body style="font-family: 'Segoe UI', sans-serif; color: #333; background-color: #f7f9fc; padding: 2rem;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <h2 style="color: #0051cb; margin-bottom: 1rem;">${title}</h2>
      ${body}
      <hr style="margin: 2rem 0;" />
      <p style="font-size: 13px; color: #888; text-align: center;">Origami Alfredo &middot; Ne válaszolj erre az e-mailre</p>
    </div>
  </body>
</html>
`;
}

/**
 * Megrendelés admin e-mail
 */
function sendAdminOrderNotification({ orderId, email, emailHash, time }) {
    const subject = `Új megrendelés érkezett – ID: ${orderId} | ${time}`;

    const textContent = `
Új megrendelés érkezett az Origami Alfredo weboldalon.

Megrendelés azonosító: ${orderId}
Időpont: ${time}

A megrendelés részletei az adminfelületen vagy az adatbázisban érhetők el.
`;

    const htmlBody = `
<p><strong>Megrendelés azonosító:</strong> <code>${emailHash}</code></p>
<p><strong>Időpont:</strong> ${time}</p>
<p>A megrendelés részleteit az adminfelületen tudod megnézni (fejlesztés alatt).</p>
`;

    const htmlContent = wrapInTemplate("Új megrendelés érkezett", htmlBody);

    return sendMail({ to: adminEmail, subject, text: textContent, html: htmlContent });
}

/**
 * Felhasználó e-mail megerősítő kód
 */
function sendConfirmationEmail(to, code) {
    const subject = `Origami Alfredo – Ellenőrző kód / Verification Code (${new Date().toLocaleString('hu-HU')})`;

    const text = `
Üdvözlünk az Origami Alfredo-n!

Az e-mail címed megerősítéséhez használd az alábbi kódot: ${code}
A kód 10 percig érvényes.

Ha nem te kérted, hagyd figyelmen kívül ezt az üzenetet.

---

Welcome to Origami Alfredo!

To confirm your email, please use the following verification code: ${code}
This code is valid for 10 minutes.

If you did not request this, you can safely ignore this message.

- Origami Alfredo Team
`;

    const htmlBody = `
<p>Az e-mail címed megerősítéséhez kérjük, használd az alábbi kódot:</p>
<div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 1rem 0; text-align: center;">${code}</div>
<p>A kód <strong>10 percig érvényes</strong>.</p>
<p style="margin-top: 2rem;">Ha nem te kérted ezt a műveletet, nyugodtan hagyd figyelmen kívül.</p>

<hr style="margin: 2rem 0;" />

<p>Please use the following verification code to confirm your subscription:</p>
<div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 1rem 0; text-align: center;">${code}</div>
<p>This code is valid for <strong>10 minutes</strong>.</p>
<p>If you did not request this, you can safely ignore this email.</p>
`;

    const html = wrapInTemplate("Ellenőrző kód / Verification Code", htmlBody);

    return sendMail({ to, subject, text, html })
        .then(info => {
            console.log("Verification email sent:", info.messageId);
            console.log(`[NEWSLETTER DOUBLE OPT-IN] Email sent to: ${to} | Code: ${code} | Time: ${new Date().toISOString()}`);
        })
        .catch(err => {
            console.error("[EMAIL SERVICE ERROR]:", err.message);
            throw new Error("Failed to send confirmation email");
        });
}

/**
 * Alap e-mail küldés
 */
function sendMail({ to, subject, text, html }) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
    };

    return transporter.sendMail(mailOptions);
}

function sendTokenExpiryReminder({ userId, expiresAt }) {
    const subject = `Instagram token hamarosan lejár (${userId})`;
    const text = `A(z) ${userId} tokenje lejár: ${expiresAt}`;

    const htmlBody = `
<p style="font-size: 16px;">Kedves Admin,</p>
<p style="font-size: 16px;">A(z) <strong style="color: #0051cb;">${userId}</strong> felhasználó Instagram tokenje hamarosan lejár:</p>
<div style="background-color: #fff; border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 6px;">
  <p style="font-size: 18px; margin: 0;"><strong>Lejárat dátuma:</strong> ${new Date(expiresAt).toLocaleString("hu-HU")}</p>
</div>
<p style="font-size: 14px; color: #777;">Kérjük, szükség esetén értesítsd a felhasználót, vagy újítsd meg a tokent.</p>
`;

    const html = wrapInTemplate("Token lejárati emlékeztető", htmlBody);

    return sendMail({
        to: adminEmail,
        subject,
        text,
        html,
    });
}

module.exports = {
    sendMail,
    sendConfirmationEmail,
    sendAdminOrderNotification,
    sendTokenExpiryReminder,
};
