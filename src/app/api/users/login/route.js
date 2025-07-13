import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    await connectDB();
    
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json({ message: 'Username dan password harus diisi' }, { status: 400 });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return Response.json({ message: 'Username atau password salah' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json({ message: 'Username atau password salah' }, { status: 401 });
    }

    // Update online status
    await User.findByIdAndUpdate(user._id, {
      isOnline: true,
      lastSeen: new Date()
    });

    const token = generateToken(user._id, user.role);

    return Response.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
