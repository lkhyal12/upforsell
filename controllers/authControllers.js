import {
  assignTokenToCookies,
  generateTokens,
  logControllerError,
  sendEmailVerificationCode,
  sendPasswordResetCodeFunc,
} from "../lib/utils.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function registerUserController(req, res) {
  const { name, email, password } = req.body;
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();
  if (!trimmedName || !trimmedEmail || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existingUser = await UserModel.findOne({ email: trimmedEmail });
    if (existingUser)
      return res.status(409).json({ message: "Email Already taken" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(Math.random() * 900000) + 100000;
    const verificationCodeExpires = Date.now() + 15 * 60 * 1000;

    const user = await UserModel.create({
      email: trimmedEmail,
      name: trimmedName,
      password: hashedPassword,
      emailVerificationCode: verificationCode,
      verificationCodeExpires,
    });
    const isVerficationCodeSent = await sendEmailVerificationCode(
      user.email,
      verificationCode,
    );
    if (!isVerficationCodeSent)
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    const { accessToken, refreshToken } = generateTokens(user._id);
    assignTokenToCookies(refreshToken, res);
    return res.status(201).json({
      message:
        "User created successfully check your email to verify your account",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (err) {
    logControllerError("registerUserController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// login controller

export async function loginController(req, res) {
  const { email, password } = req.body;
  const trimmedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedEmail || !password)
    return res.status(400).json({ message: "Email and Password are required" });

  try {
    const user = await UserModel.findOne({ email: trimmedEmail });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });
    const { accessToken, refreshToken } = generateTokens(user._id);
    assignTokenToCookies(refreshToken, res);
    return res.status(200).json({
      message: "you logged in successfully",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        _id: user._id,
      },
      accessToken,
    });
  } catch (err) {
    logControllerError("login", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// logout controller
export async function logoutController(req, res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
}

// get user profile
export async function getProfile(req, res) {
  const user = req.user;
  return res.status(200).json({ message: "Profile sent successfully", user });
}

// refresh controller
export function refreshController(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token missing",
    });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
    );
    assignTokenToCookies(newRefreshToken, res);
    return res
      .status(200)
      .json({ message: "new accessToken was issued", accessToken });
  } catch (err) {
    console.log("refresh", err);
    return res.status(401).json({ message: "Invalid or expired refreshToken" });
  }
}

// verify email controller
export async function verifyEmailController(req, res) {
  const { code, email } = req.body;
  if (!code)
    return res.status(400).json({ message: "Missing verification code" });
  if (!email) return res.status(400).json({ message: "Missing email address" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (
      code !== user.emailVerificationCode ||
      user.emailVerificationCodeExpires < Date.now()
    )
      return res.status(400).json({ message: "Invalid or expired code" });
    user.verified = true;
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpires = null;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    logControllerError("verifyEmailController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// send password reset code
export async function sendResetPasswordCodeController(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ messsage: "Email is required" });

  try {
    const trimmedEmail = String(email).trim().toLowerCase();
    const user = await UserModel.findOne({ email: trimmedEmail }).select(
      "-password",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const generatedCode = crypto.randomBytes(16).toString("hex");
    const emailSent = await sendPasswordResetCodeFunc(
      trimmedEmail,
      generatedCode,
    );
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send reset code" });
    }

    user.resetPasswordCode = generatedCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    return res
      .status(200)
      .json({ message: "Reset password code sent successfully" });
  } catch (err) {
    logControllerError("sendResetPasswordCodeController", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// verify reset password
export async function resetPasswordController(req, res) {
  const { password, email } = req.body;
  const { code } = req.params;
  console.log({ code });
  if (!code) return res.status(400).json({ message: "code is required" });
  if (!email) return res.status(400).json({ message: "email is required" });
  if (!password)
    return res.status(400).json({ message: "password is required" });

  try {
    const trimmedEmail = String(email).trim().toLowerCase();
    const user = await UserModel.findOne({ email: trimmedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isCodeExpired =
      !user.resetPasswordExpires || user.resetPasswordExpires < Date.now();
    if (code !== user.resetPasswordCode || isCodeExpired) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    logControllerError("verifyResetPasswordCodeController", err);
    return res.status(500).json({ message: "Server error" });
  }
}
