// app/sitemap.ts

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.designmo.my.id', // GANTI DENGAN URL UTAMA ANDA
      lastModified: new Date(),
    },
    // Tambahkan halaman lain di sini jika perlu
    // {
    //   url: 'https://domain-anda.com/tentang',
    //   lastModified: new Date(),
    // },
  ]
}