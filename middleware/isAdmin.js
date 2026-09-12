export function isAdmin(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "User not found" });
  if (user.role !== "admin")
    return res.status(403).json({ message: "You dont have permission" });
  next();
}
