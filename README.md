# Catalog Panel

Panel manajemen proyek design yang terintegrasi dengan MongoDB dan dapat di-deploy di Vercel.

## Fitur

- **Authentication & Authorization**: Login dengan JWT, role-based access (Admin & Anggota)
- **Project Management**: CRUD operations untuk proyek dengan preview otomatis
- **User Management**: Admin dapat mengelola user, reset password, dan melihat status online
- **Real-time Status**: Sistem ping otomatis untuk mengetahui user yang online
- **Link Preview**: Otomatis mengambil preview gambar dari link yang diberikan
- **Responsive Design**: UI yang responsive menggunakan Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB dengan Mongoose
- **Authentication**: JWT
- **Deployment**: Vercel

## Setup

### 1. Clone dan Install Dependencies

```bash
git clone <repository-url>
cd integrated-app
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local` berdasarkan `.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/wes-catalog
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database

Pastikan MongoDB berjalan dan buat database baru. Aplikasi akan otomatis membuat collections yang diperlukan.

### 4. Create Admin User

Untuk membuat admin pertama, Anda bisa menggunakan MongoDB Compass atau CLI:

```javascript
db.users.insertOne({
  username: "admin",
  fullName: "Administrator",
  password: "$2a$10$...", // hash dari password menggunakan bcrypt
  role: "admin",
  isOnline: false,
  lastSeen: null,
});
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Deployment ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy di Vercel

1. Login ke [Vercel](https://vercel.com)
2. Import project dari GitHub
3. Tambahkan environment variables di Vercel dashboard:
   - `MONGO_URI`: Connection string MongoDB Atlas
   - `JWT_SECRET`: Secret key untuk JWT
   - `FRONTEND_URL`: URL domain Vercel Anda

### 3. Setup MongoDB Atlas

Untuk production, gunakan MongoDB Atlas:

1. Buat cluster di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP Vercel (0.0.0.0/0 untuk semua IP)
3. Copy connection string dan masukkan ke `MONGO_URI`

## Struktur Project

```
integrated-app/
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.js       # Root layout
│   │   └── page.js         # Login page
│   ├── components/         # Reusable components
│   ├── lib/               # Utilities
│   ├── middleware/        # Authentication middleware
│   └── models/           # Database models
├── public/               # Static assets
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/users/login` - Login user
- `POST /api/users/ping` - Update online status

### User Management (Admin only)

- `GET /api/users` - Get all users
- `POST /api/users/register` - Register new user
- `POST /api/users/[id]` - Reset user password
- `DELETE /api/users/[id]` - Delete user

### Project Management

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project (Admin only)
- `DELETE /api/projects/[id]` - Delete project (Admin only)

## Fitur Khusus

### Link Preview

- Otomatis mengambil preview gambar dari link
- Support untuk PDF, Google Drive, dan link umum
- Fallback ke placeholder jika preview gagal

### Role-based Access

- **Admin**: Dapat CRUD semua proyek, manage users, akses semua fitur
- **Anggota**: Hanya dapat menambah proyek dari Canva, view proyek

### Online Status

- Sistem ping otomatis setiap 30 detik
- Menampilkan status online/offline user
- Auto-logout saat browser ditutup

## Troubleshooting

### Error Connection MongoDB

- Pastikan MongoDB berjalan
- Periksa connection string di `.env.local`
- Untuk Atlas, pastikan IP sudah di-whitelist

### Error JWT

- Pastikan `JWT_SECRET` sudah diset
- Token expired, coba login ulang

### Error Deployment Vercel

- Pastikan semua environment variables sudah diset
- Periksa build logs di Vercel dashboard
- Pastikan MongoDB Atlas accessible dari internet

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License
SEN9945