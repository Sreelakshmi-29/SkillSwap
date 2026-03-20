const jwt = require('jsonwebtoken');

const tokenService = {
  
  generateAccessToken: (userId) => {
    return jwt.sign(
      { userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
  },

  generateRefreshToken: (userId) => {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
  },

  verifyAccessToken: (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  },

  verifyRefreshToken: (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  },

  setRefreshTokenCookie: (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  },

  clearRefreshTokenCookie: (res) => {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });
  },
};

module.exports = tokenService;