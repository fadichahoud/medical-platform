const User = require('../models/User');
const { sendSmsToken } = require('../utils/smsService');

const tokenStore = {};

exports.requestToken = async (req, res) => {
  const { phone } = req.body;
  
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const token = await sendSmsToken(phone);
    tokenStore[phone] = token;
    
    setTimeout(() => {
      if (tokenStore[phone] === token) delete tokenStore[phone];
    }, 600000);

    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando token SMS:', error);
    res.status(500).json({ error: 'Error enviando SMS' });
  }
};

exports.verifyToken = async (req, res) => {
  const { phone, token } = req.body;
  
  if (tokenStore[phone] === token) {
    delete tokenStore[phone];
    const user = await User.findOne({ phone }).select('-fingerprintHash');
    
    const sessionToken = Buffer.from(`${phone}:${Date.now()}`).toString('base64');
    res.json({ 
      success: true, 
      token: sessionToken,
      user
    });
  } else {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};