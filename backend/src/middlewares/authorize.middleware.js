export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('=== Authorize Middleware Debug ===');
    console.log('Required roles:', roles);
    console.log('User from req:', req.user);
    console.log('User role:', req.user?.role);
    console.log('Role check result:', roles.includes(req.user?.role));
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Authorization failed - insufficient permissions');
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions"
      });
    }

    console.log('✅ Authorization successful');
    next();
  };
};