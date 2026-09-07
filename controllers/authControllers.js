import {
  assignTokenToCookies,
  generateTokens,
  logControllerError,
} from "../lib/utils.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs";

export async function registerUserController(req, res) {
  const { name, email, password } = req.body;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
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
        userId: user._id,
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
