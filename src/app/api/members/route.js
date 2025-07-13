import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate } from '@/middleware/auth';

export async function GET(req) {
  try {
    await connectDB();
    
    const auth = await authenticate(req);
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

    // Get all users (anggota and admin) for members to see
    const users = await User.find({}).select('fullName username isOnline lastSeen role');
    
    return Response.json(users);

  } catch (error) {
    console.error('Get members error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
