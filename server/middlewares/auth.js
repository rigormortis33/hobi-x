const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Authorization header'ını al
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Yetkilendirme başlığı bulunamadı' });
    }

    // Bearer token'ı ayır
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token bulunamadı' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Kimlik doğrulama başarısız', error: error.message });
  }
};
