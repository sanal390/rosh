import nodemailer from "nodemailer";

let transporter;

export const initEmailService = () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      initEmailService();
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};

export const sendOrderConfirmation = async (user, order) => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
    <p><strong>Status:</strong> ${order.orderStatus}</p>
    <hr />
    <h3>Items:</h3>
    <ul>
      ${order.items.map((item) => `<li>${item.productName} x ${item.quantity} - ₹${item.price}</li>`).join("")}
    </ul>
    <hr />
    <p>We'll update you soon with shipping details.</p>
  `;

  return sendEmail(user.email, "Order Confirmation - TechHub", html);
};

export const sendPasswordReset = async (email, resetLink) => {
  const html = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request this, ignore this email.</p>
  `;

  return sendEmail(email, "Password Reset - TechHub", html);
};
