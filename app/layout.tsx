import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import { AppProvider } from '@/components/AppProvider';
import BorderFrame from '@/components/BorderFrame';
import GlobalKeyboard from '@/components/GlobalKeyboard';

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans'
});

export const metadata: Metadata = {
  title: 'SNB Puzzle App',
  description: 'Interactive kiosk puzzle game',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={ibmPlexSans.className}>
        <AppProvider>
          {/* Main Content with Border Frame */}
          <BorderFrame>
            <div className="kiosk-content">
              {children}
            </div>
          </BorderFrame>
          
          {/* Global Keyboard - Rendered outside BorderFrame */}
          <GlobalKeyboard />
        </AppProvider>
      </body>
    </html>
  );
}