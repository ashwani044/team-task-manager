const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        message: `Access denied. ${requiredRole}s only.` 
      });
    }
    next();
  };
};

module.exports = roleMiddleware;