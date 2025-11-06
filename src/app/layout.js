import './globals.css';
import { Inter } from 'next/font/google';

// --- IMPORT YOUR NEW PROVIDER ---
import AuthProvider from './components/AuthProvider'; 

const inter = Inter({ subsets: ['latin'] });

// metadata is a server-side constant (left untouched)
export const metadata = {
  title: 'Travel Log',
  description: 'My personal travel log app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* --- FIX: Wrap the entire application in the AuthProvider --- */}
        {/* This ensures Amplify is configured and the Context is ready everywhere. */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}