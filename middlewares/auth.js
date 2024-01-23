import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  let token;

  try {
    token = req.headers["x-auth-token"];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodeData; // Set user information in the request
    req.userId = decodeData.id; // Set user ID in the request

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error!!!" });
  }
};

export default auth;
