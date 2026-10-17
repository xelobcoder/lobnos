
'use client';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../node_modules/react-datepicker/dist/react-datepicker.min.css'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PrimeToast from "../components/accessories/PrimeToast";
import { ThemeProvider } from '../components/ThemeProvider';
import { Inter, Open_Sans, Raleway, Lato, Roboto, Nunito_Sans, Source_Sans_3, Poppins, IBM_Plex_Sans, Noto_Sans, Work_Sans, DM_Sans, Public_Sans, Fira_Sans } from 'next/font/google';

const ibmPlexSans = IBM_Plex_Sans({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-ibm-plex-sans', display: 'swap' });
const notoSans = Noto_Sans({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-noto-sans', display: 'swap' });
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work-sans', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans', display: 'swap' });
const firaSans = Fira_Sans({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-fira-sans', display: 'swap' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-roboto', display: 'swap' });
const nunitoSans = Nunito_Sans({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-nunito-sans', display: 'swap' });
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans', display: 'swap' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins', display: 'swap' });

const lato = Lato({
     weight: ['400', '700', '900'],
     subsets: ['latin'],
     variable: '--font-lato',
     display: 'swap',
});

const inter = Inter({
     subsets: ['latin'],
     weight: ['400', '500', '600', '700'],
     variable: '--font-inter',
     display: 'swap',
});

const raleway = Raleway({
     weight: ['400', '500', '600', '700'],
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
          <html lang="en" className={`${inter.variable} ${raleway.variable} ${openSans.variable} ${lato.variable} ${roboto.variable} ${nunitoSans.variable} ${sourceSans.variable} ${poppins.variable} ${ibmPlexSans.variable} ${notoSans.variable} ${workSans.variable} ${dmSans.variable} ${publicSans.variable} ${firaSans.variable}`} style={{ '--font-candara': 'Candara, sans-serif', '--font-segoe': '"Segoe UI", Tahoma, sans-serif' } as React.CSSProperties}>
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
