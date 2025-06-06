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
        subject: `Origami Alfredo – Verification code (${new Date().toLocaleString('hu-HU')})`,
        text: `Welcome to Origami Alfredo!

Your email verification code is: ${code}

Please enter this code on the website to complete your subscription.
This code is valid for 10 minutes.

If you did not request this, you can safely ignore this message.

- Origami Alfredo Team`,
        html: `
      <div style="font-family: 'Poppins', sans-serif; color: #333;">
        <h2 style="color: #0051cb;">Welcome to Origami Alfredo!</h2>
        <p>To confirm your newsletter subscription, please use the following verification code:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 1rem 0;">
          ${code}
        </div>
        <p>This code is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <br/>
        <p style="font-size: 14px; color: #888;">Origami Alfredo Team</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent:", info.messageId);
    } catch (err) {
        console.error("[EMAIL SERVICE ERROR]:", err.message);
        const error = new Error("Failed to send confirmation email");
        error.statusCode = 500;
        throw error;
    }
};
