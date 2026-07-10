import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  try {
    console.log("================================");
    console.log("AUTH HEADER:", req.headers.authorization);

    const token = req.headers.authorization?.split(" ")[1];

    console.log("TOKEN:", token);

    if (!token) {
      console.log("❌ No token");
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ JWT VERIFIED");
    console.log(decoded);

    req.user = decoded;

    next();
  } catch (err) {
    console.log("❌ JWT VERIFY ERROR");
    console.log(err);

    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Required Roles:", roles);
    console.log("User Role:", req.user?.role);

    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log("❌ Role mismatch");

      return res.status(403).json({
        error: "Access denied",
      });
    }

    next();
  };
};