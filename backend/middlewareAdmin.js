// middlewareAdmin.js

const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  // Check for token in Authorization header
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided. Authorization denied." });
  }

  try {
    // Get the secret key from environment variables or use the hardcoded one as fallback
    const secretKey = process.env.SECRET_KEY || "b0742345623214e7f5aac75a4200799d80b55d26a62b97cd23015c33ae3ac11513e2e7";
    
    // Verify the token
    const decoded = jwt.verify(token, secretKey);

    // Check if the user role is manager
    if (decoded.user && decoded.user.role && decoded.user.role.toLowerCase() === "manager") {
      req.user = decoded.user; // Attach user info to the request object
      next();
    } else {
      return res.status(403).json({ message: "Forbidden: Managers only." });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid token. Authorization denied." });
  }
};

module.exports = verifyAdmin;
