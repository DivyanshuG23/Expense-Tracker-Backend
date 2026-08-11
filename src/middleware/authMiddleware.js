import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Cookie se token lena
    const token = req.cookies.token;

    // Agar token nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please Login.",
      });
    }

    // Token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User ki id request me save karna
    req.user = decoded;

    // Next middleware/controller
    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};

export default authMiddleware;