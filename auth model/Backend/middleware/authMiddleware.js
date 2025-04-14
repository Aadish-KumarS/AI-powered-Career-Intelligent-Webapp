import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const tokenWithoutBearer = token.split(" ")[1];
    if (!tokenWithoutBearer) {
      return res.status(401).json({ message: "Unauthorized - Invalid token format" });
    }
    const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.user = verified;

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
