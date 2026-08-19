import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: 'ParcelOS — Last-Mile Delivery Tracker',
  description: 'Track. Deliver. Dominate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="top-right" 
            toastOptions={{
              className: '!border-4 !border-neo-black !rounded-none !shadow-neo !font-mono !font-bold',
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
