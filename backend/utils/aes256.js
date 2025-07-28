const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secret = process.env.CRYPTO_SECRET;

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}

function decrypt(encryptedData) {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const encryptedText = Buffer.from(encryptedData.content, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };