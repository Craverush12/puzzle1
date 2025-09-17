import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import { AppProvider } from '@/components/AppProvider';

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans'
});

export const metadata: Metadata = {
  title: 'SNB Puzzle App',
  description: 'Interactive kiosk puzzle game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={ibmPlexSans.className}>
        {/* Main Content */}
        <div className="kiosk-content">
          <AppProvider>
            {children}
          </AppProvider>
        </div>
      </body>
    </html>
  );
}