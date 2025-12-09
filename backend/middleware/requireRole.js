/**
 * Middleware factory to restrict access based on user roles
 * Must be used after verifyToken middleware (requires req.userDoc)
 * 
 * @param {...string} allowedRoles - List of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/admin-only', verifyToken, requireRole('admin'), controller);
 * router.post('/faculty-or-admin', verifyToken, requireRole('faculty', 'admin'), controller);
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure verifyToken middleware has run first
    if (!req.userDoc) {
      return res.status(500).json({ 
        msg: "Server configuration error: requireRole must be used after verifyToken middleware" 
      });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.userDoc.role)) {
      return res.status(403).json({ 
        msg: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.userDoc.role}` 
      });
    }

    next();
  };
};

module.exports = { requireRole };
