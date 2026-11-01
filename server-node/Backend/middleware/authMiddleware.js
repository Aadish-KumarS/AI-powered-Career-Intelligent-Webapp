import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  try {
    const authorization = req.header("Authorization");

    if (!authorization) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: "Unauthorized - Invalid token format" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
