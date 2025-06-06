const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendConfirmationEmail = async (to, code) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        replyTo: process.env.EMAIL_USER,
        subject: `Origami Alfredo – Ellenőrző kód / Verification Code (${new Date().toLocaleString('hu-HU')})`,
        text: `Üdvözlünk az Origami Alfredo-n!

Az e-mail címed megerősítéséhez használd az alábbi kódot: ${code}
A kód 10 percig érvényes.

Ha nem te kérted, hagyd figyelmen kívül ezt az üzenetet.

---

Welcome to Origami Alfredo!

To confirm your email, please use the following verification code: ${code}
This code is valid for 10 minutes.

If you did not request this, you can safely ignore this message.

- Origami Alfredo Team`,
        html: `<div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #0051cb;">Üdvözlünk az Origami Alfredo-n!</h2>
          <p>Az e-mail címed megerősítéséhez kérjük, használd az alábbi kódot:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 1rem 0;">${code}</div>
          <p>A kód <strong>10 percig érvényes</strong>.</p>
          <p>Ha nem te kérted ezt a műveletet, nyugodtan hagyd figyelmen kívül.</p>
          <hr style="margin: 2rem 0;" />
          <h2 style="color: #0051cb;">Welcome to Origami Alfredo!</h2>
          <p>Please use the following verification code to confirm your subscription:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 1rem 0;">${code}</div>
          <p>This code is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p style="font-size: 14px; color: #888;">Origami Alfredo Team</p>
        </div>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent:", info.messageId);
    } catch (err) {
        console.error("[EMAIL SERVICE ERROR]:", err.message);
        throw new Error("Failed to send confirmation email");
    }
};
