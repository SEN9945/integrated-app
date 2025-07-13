import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/middleware/auth';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    
    const auth = await requireAdmin(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const { password } = await req.json();

    if (!password) {
      return Response.json({ message: 'Password baru wajib diisi' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    return Response.json({ message: 'Password berhasil direset' });

  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ message: 'Gagal reset password' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const auth = await requireAdmin(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    const { id } = params;

    const user = await User.findById(id);
    if (!user) {
      return Response.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return Response.json({ message: 'Admin tidak dapat dihapus' }, { status: 400 });
    }

    await User.findByIdAndDelete(id);

    return Response.json({ message: 'User berhasil dihapus' });

  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({ message: 'Gagal menghapus user' }, { status: 500 });
  }
}
