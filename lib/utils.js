import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "./nodemailer.js";
dotenv.config();

export async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);

    console.log("connected to mongodb successfully");
  } catch (err) {
    console.log("failed to connect to mongodb ", err);
  }
}

export function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

export function assignTokenToCookies(refreshToken, res) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function logControllerError(functionName, error) {
  console.log(`error in the ${functionName}: ${error}`);
}

export async function sendPasswordResetCodeFunc(email, code) {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${code}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}\n\nOr open this link: ${resetUrl}`,
      html: `
        <div style="
          max-width: 500px;
          margin: 40px auto;
          padding: 30px;
          font-family: Arial, sans-serif;
          background: #f8f9fa;
          border-radius: 12px;
          text-align: center;
        ">

          <h2 style="
            margin-bottom: 10px;
            color: #111827;
          ">
            Reset Your Password
          </h2>

          <p style="
            color: #6b7280;
            font-size: 15px;
            line-height: 1.6;
          ">
            You requested to reset your password.
            Use this code or click the button below to continue.
          </p>

          <p style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 20px 0;
            color: #111827;
          ">
            ${code}
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              margin: 20px 0;
              padding: 12px 24px;
              background: #111827;
              color: #ffffff;
              text-decoration: none;
              font-size: 15px;
              font-weight: bold;
              border-radius: 8px;
            "
          >
            Reset Password
          </a>

          <p style="
            color: #9ca3af;
            font-size: 13px;
            line-height: 1.5;
          ">
            This link will expire in 15 minutes.
            If you didn't request a password reset,
            you can safely ignore this email.
          </p>

        </div>
      `,
    });
    return true;
  } catch (err) {
    console.log("error in the sendPasswordResetCodeFunc ", err);
    return false;
  }
}

// send email verification code
export async function sendEmailVerificationCode(email, code) {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,

      text: `Your email verification code is: ${code}. This code will expire in 15 minutes.`,

      html: `
        <div style="
          margin: 0;
          padding: 40px 20px;
          background-color: #f4f4f5;
          font-family: Arial, Helvetica, sans-serif;
        ">
          <div style="
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          ">

            <h1 style="
              margin: 0 0 10px;
              color: #18181b;
              font-size: 26px;
            ">
              Verify Your Email
            </h1>

            <p style="
              margin: 0 0 30px;
              color: #71717a;
              font-size: 15px;
              line-height: 1.6;
            ">
              Thanks for signing up! Use the verification code below
              to verify your email address.
            </p>

            <div style="
              display: inline-block;
              padding: 16px 30px;
              margin-bottom: 25px;
              background-color: #f4f4f5;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
            ">
              <span style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #18181b;
              ">
                ${code}
              </span>
            </div>

            <p style="
              margin: 0 0 10px;
              color: #71717a;
              font-size: 14px;
            ">
              This code will expire in <strong>15 minutes</strong>.
            </p>

            <p style="
              margin: 25px 0 0;
              color: #a1a1aa;
              font-size: 12px;
              line-height: 1.5;
            ">
              If you didn't request this verification code,
              you can safely ignore this email.
            </p>

          </div>
        </div>
      `,
    });

    return true;
  } catch (err) {
    console.log("error in sendemailverificationcode function ", err);
    return false;
  }
}
