// app/sitemap.ts

import { MetadataRoute } from 'next'

// URL utama website Anda
const baseUrl = 'https://www.designmo.my.id' 

export default function sitemap(): MetadataRoute.Sitemap {
  
  // Daftar halaman berdasarkan perannya
  const publicRoutes = [
    '', // Halaman utama yang mengarah ke login
  ];

  const userRoutes = [
    '/dashboard', // Halaman setelah user login
  ];

  const adminRoutes = [
    '/dashboard/users', // Halaman khusus admin
  ];

  // Membuat sitemap untuk halaman publik
  const publicSitemap = publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as 'monthly',
    priority: 0.7, 
  }));

  // Membuat sitemap untuk halaman user (setelah login)
  const userSitemap = userRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as 'weekly',
    priority: 0.5,
  }));

  // Membuat sitemap untuk halaman admin
  const adminSitemap = adminRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as 'yearly',
    priority: 0.1, // Prioritas sangat rendah karena tidak untuk publik
  }));

  // Menggabungkan semua sitemap menjadi satu
  return [
    ...publicSitemap,
    ...userSitemap,
    ...adminSitemap,
  ];
}
