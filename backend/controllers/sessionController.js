exports.checkUserSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({ message: "User logged in", user: req.session.user });
  } else {
    return res.status(401).json({ message: "User not logged in" });
  }
};

exports.checkOfficerSession = (req, res) => {
  if (req.session && req.session.officer) {
    return res.status(200).json({ message: "Officer logged in", officer: req.session.officer });
  } else {
    return res.status(401).json({ message: "Officer not logged in" });
  }
};

exports.checkAdminSession = (req, res) => {
  if (req.session && req.session.admin) {
    return res.status(200).json({ message: "Admin logged in", admin: req.session.admin });
  } else {
    return res.status(401).json({ message: "Admin not logged in" });
  }
};