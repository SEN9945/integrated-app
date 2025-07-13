import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/middleware/auth';

export async function GET(req) {
  try {
    await connectDB();
    
    const auth = await requireAdmin(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    // Mark users as offline if last seen > 10 minutes
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    await User.updateMany({
      role: 'anggota',
      isOnline: true,
      lastSeen: { $lt: tenMinutesAgo }
    }, {
      isOnline: false
    });

    // Get all non-admin users
    const users = await User.find({ role: 'anggota' }).select('-password');
    
    return Response.json(users);

  } catch (error) {
    console.error('Get users error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
