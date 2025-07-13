import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/middleware/auth';

export async function POST(req) {
  try {
    await connectDB();
    
    const auth = await requireAdmin(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }
    
    const { username, fullName, password, role } = await req.json();

    if (!username || !fullName || !password) {
      return Response.json({ message: 'Mohon isi semua field' }, { status: 400 });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      return Response.json({ message: 'Username sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      fullName,
      password: hashedPassword,
      role: role || 'anggota',
    });

    return Response.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
