import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate } from '@/middleware/auth';

export async function POST(req) {
  try {
    await connectDB();
    
    const auth = await authenticate(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    let action = 'ping'; // default action
    
    // Try to parse JSON body, but don't fail if it's empty
    try {
      const body = await req.text();
      if (body && body.trim()) {
        const parsedBody = JSON.parse(body);
        action = parsedBody.action || 'ping';
      }
    } catch (parseError) {
      // If JSON parsing fails, use default action
      console.log('Ping request with no body or invalid JSON, using default action');
    }

    if (action === 'offline') {
      await User.findByIdAndUpdate(auth.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
    } else {
      // Default ping action
      await User.findByIdAndUpdate(auth.userId, {
        isOnline: true,
        lastSeen: new Date()
      });
    }

    return Response.json({ message: 'Status updated' });

  } catch (error) {
    console.error('Ping error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
