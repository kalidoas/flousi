import nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS } = process.env;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

export const sendPasswordResetCode = async ({ to, code }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email credentials are not configured");
  }

  return transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject: "Your password reset code",
    text: `Your Flousi reset code is ${code}. It expires in 15 minutes.`
  });
};

