const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../error/");
const authAuthenticationMiddleware = async (req, res, next) => {
  const headers = req.headers.authorization;

  if (!headers || !headers.startsWith("Bearer ")) {
    return res.redirect("/login/");
    // throw new UnauthenticatedError("No token provided");
  }

  const token = headers.split(" ")[1];
  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    const { name, admin } = decoded;
    req.user = { name, admin };
  } catch (error) {
    // if token invalid
    console.log(error);
    throw new UnauthenticatedError("Not authorized to access this route");
  }
  next();
};

module.exports = authAuthenticationMiddleware;
