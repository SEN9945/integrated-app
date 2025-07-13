import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export const authenticate = async (req) => {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return { error: 'No token provided', status: 401 };
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { error: 'Invalid token', status: 401 };
    }

    await connectDB();
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    // Update last seen and online status
    await User.findByIdAndUpdate(decoded.userId, {
      lastSeen: new Date(),
      isOnline: true
    });

    return { user, userId: decoded.userId, role: decoded.role };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
};

export const requireAdmin = async (req) => {
  const auth = await authenticate(req);
  
  if (auth.error) {
    return auth;
  }
  
  if (auth.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }
  
  return auth;
};
