import './globals.css';
import { Inter } from 'next/font/google';

// This is our new client component
import ConfigureAmplify from './ConfigureAmplify';

const inter = Inter({ subsets: ['latin'] });

// This 'metadata' export is now happy, because 'use client' is gone
export const metadata = {
  title: 'Travel Log',
  description: 'My personal travel log app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* We wrap the children with our new component.
          This component will configure Amplify and then just
          render the rest of the app inside it.
        */}
        <ConfigureAmplify>
          {children}
        </ConfigureAmplify>
      </body>
    </html>
  );
}