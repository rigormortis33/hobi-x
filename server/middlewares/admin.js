module.exports = (req, res, next) => {
  if (!req.userData || !req.userData.isAdmin) {
    return res.status(403).json({ success: false, message: 'Bu işlem için admin yetkisi gerekli' });
  }
  next();
};
