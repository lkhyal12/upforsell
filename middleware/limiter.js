const map = {};

export function limiter(req, res, next) {
  const key = req.ip + "*" + req.url;
  if (!map[key]) map[key] = [];

  map[key] = map[key].filter(
    (timeStamp) => timeStamp > Date.now() - 5 * 60 * 1000,
  );
  if (map[key].length >= 5)
    return res.status(429).json({ message: "Too manu requests" });
  map[key].push(Date.now());
  next();
}
