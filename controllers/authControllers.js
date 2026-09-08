import {
  assignTokenToCookies,
  generateTokens,
  logControllerError,
} from "../lib/utils.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
    const user = await UserModel.create({
      email: trimmedEmail,
      name: trimmedName,
      password: hashedPassword,
    });
    const { accessToken, refreshToken } = generateTokens(user._id);
    assignTokenToCookies(refreshToken, res);
    return res.status(201).json({
      message: "User created successfully",
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
  const trimmedEmail = email.trim();
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
