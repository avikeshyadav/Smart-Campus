// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

// Password ko bcrypt se hash karo (salted, adaptive hashing)
async function hashPassword(plainPassword) { 
  return bcrypt.hash(plainPassword, 10); 
} 

// Plain password ko stored hash ke against verify karo
async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

// Random secure token generate karo (email verification / password reset ke liye)
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

// Token ko DB me store karne se pehle hash karo (raw token kabhi DB me store mat karo)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { hashPassword, comparePassword, generateSecureToken, hashToken };
