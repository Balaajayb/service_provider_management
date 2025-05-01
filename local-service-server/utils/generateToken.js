const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const generateToken = (id, userType = 'user') => {
  // Validate inputs
  if (!id) throw new Error("ID is required for token generation");
  if (!['admin', 'user'].includes(userType)) {
    throw new Error("Invalid user type specified");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  // Standard payload with type information
  const payload = {
    [userType === 'admin' ? 'adminId' : 'userId']: id,
    iat: Math.floor(Date.now() / 1000),
    type: userType
  };

  // Token options
  const options = {
    expiresIn: userType === 'admin' ? '8h' : '7d',
    algorithm: 'HS256'
  };

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    
    // Verify token structure immediately after generation
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error("Generated token has invalid structure");
    }

    console.log(`Generated ${userType} token for ID ${id}`);
    return token;
  } catch (error) {
    console.error("Token generation failed:", error);
    throw new Error("Failed to generate secure token");
  }
};

module.exports = generateToken;