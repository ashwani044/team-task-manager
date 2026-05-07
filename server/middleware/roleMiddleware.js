const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user.role || req.user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      return res.status(403).json({ 
        message: `Access denied. ${requiredRole}s only.` 
      });
    }
    next();
  };
};

module.exports = roleMiddleware;