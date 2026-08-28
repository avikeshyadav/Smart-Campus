const jwt = require('jsonwebtoken');
require('dotenv').config();

// Short-lived access token - API requests ke liye
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
}

// Long-lived refresh token - naya access token lene ke liye
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  }); 
}
function generateTemperaryToken(value){
  return jwt.sign(value, process.env.TEMPORARY_2FA_SECRET,{
    expiresIn:process.env.TEMPORARY_2FA_SECRET_EXPIRY || "2m",
});
}

function verifyAccessToken1(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
function verifyTemperoryToken(token){
  return jwt.verify(token, process.env.TEMPORARY_2FA_SECRET);
};
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTemperaryToken,
  verifyAccessToken1,
  verifyRefreshToken,
  verifyTemperoryToken,
};
