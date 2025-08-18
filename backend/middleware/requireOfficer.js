module.exports = (req, res, next) => {
  if (!req.session || !req.session.officer) {
    return res.status(401).json({ message: 'Unauthorized: Officer session required' });
  }
  next();
};
