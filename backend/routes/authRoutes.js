const express = require('express');
const router = express.Router();
const { sendSmsToken, generateToken } = require('../utils/smsService');
const User = require('../models/User');

// Almacenamiento temporal para tokens (en producción usar Redis)
const tokenStore = {};

router.post('/request-token', async (req, res) => {
  const { phone } = req.body;
  
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const token = await sendSmsToken(phone);
    tokenStore[phone] = token;
    
    // Limpiar token después de 10 minutos
    setTimeout(() => {
      if (tokenStore[phone] === token) delete tokenStore[phone];
    }, 600000);

    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando token SMS:', error);
    res.status(500).json({ error: 'Error enviando SMS' });
  }
});

router.post('/verify-token', async (req, res) => {
  const { phone, token } = req.body;
  
  if (tokenStore[phone] === token) {
    delete tokenStore[phone];
    
    // Crear token de sesión simple (en producción usar JWT)
    const sessionToken = Buffer.from(`${phone}:${Date.now()}`).toString('base64');
    res.json({ 
      success: true, 
      token: sessionToken,
      user: await User.findOne({ phone }).select('-fingerprintHash')
    });
  } else {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

module.exports = router;