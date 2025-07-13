import { ToasterProvider } from '@/components/ToasterProvider';
import './globals.css';

export const metadata = {
  title: 'Catalog Panel',
  description: 'Panel manajemen proyek design',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
