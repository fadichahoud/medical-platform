const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSmsToken(phoneNumber) {
  const token = generateToken();
  
  await client.messages.create({
    body: `Su código de acceso: ${token} - Vence en 10 minutos`,
    to: phoneNumber,
    from: process.env.TWILIO_NUMBER
  });

  return token;
}

module.exports = { sendSmsToken, generateToken };