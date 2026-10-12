
'use client';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../node_modules/react-datepicker/dist/react-datepicker.min.css'
import PrimeToast from "../components/accessories/PrimeToast";
import { ThemeProvider } from '../components/ThemeProvider';
import { Inter, Open_Sans, Raleway } from 'next/font/google';

const inter = Inter({
     subsets: ['latin'],
     weight: ['400', '500', '600', '700'],
     variable: '--font-inter',
     display: 'swap',
});

const raleway = Raleway({
     subsets: ['latin'],
     variable: '--font-raleway',
     display: 'swap',
});

const openSans = Open_Sans({
     weight: ['300', '400', '500', '600', '700', '800'],
     subsets: ['latin'],
     variable: '--font-open-sans',
     display: 'swap',
});

export default function SRootLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <html lang="en" className={`${inter.variable} ${raleway.variable} ${openSans.variable}`} style={{ '--font-candara': 'Candara, sans-serif', '--font-segoe': '"Segoe UI", Tahoma, sans-serif' } as React.CSSProperties}>
               <head></head>
               <body>
                    <ThemeProvider>
                         <PrimeToast />
                         {children}
                    </ThemeProvider>
               </body>
          </html>
     );
}
