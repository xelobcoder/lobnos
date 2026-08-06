
'use client';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../node_modules/react-datepicker/dist/react-datepicker.min.css'
import PrimeToast from "../components/accessories/PrimeToast";
import { ThemeProvider } from '../components/ThemeProvider';
import { Inter, Roboto, Barlow, Rajdhani, Raleway, Roboto_Condensed, Poppins, Montserrat, Open_Sans, Lato, Lexend, Lexend_Deca, Mulish, Quicksand } from 'next/font/google';

const inter = Inter({
     subsets: ['latin'],
     variable: '--font-inter',
     display: 'swap',
});

const roboto = Roboto({
     weight: ['100', '300', '400', '500', '700', '900'],
     subsets: ['latin'],
     variable: '--font-roboto',
     display: 'swap',
});

const barlow = Barlow({
     weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
     subsets: ['latin'],
     variable: '--font-barlow',
     display: 'swap',
});

const rajdhani = Rajdhani({
     weight: ['300', '400', '500', '600', '700'],
     subsets: ['latin'],
     variable: '--font-rajdhani',
     display: 'swap',
});

const raleway = Raleway({
     subsets: ['latin'],
     variable: '--font-raleway',
     display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
     subsets: ['latin'],
     variable: '--font-roboto-condensed',
     display: 'swap',
});

const poppins = Poppins({
     weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
     subsets: ['latin'],
     variable: '--font-poppins',
     display: 'swap',
});

const montserrat = Montserrat({
     weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
     subsets: ['latin'],
     variable: '--font-montserrat',
     display: 'swap',
});

const openSans = Open_Sans({
     weight: ['300', '400', '500', '600', '700', '800'],
     subsets: ['latin'],
     variable: '--font-open-sans',
     display: 'swap',
});

const lato = Lato({
     weight: ['100', '300', '400', '700', '900'],
     subsets: ['latin'],
     variable: '--font-lato',
     display: 'swap',
});

const lexend = Lexend({
     weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
     subsets: ['latin'],
     variable: '--font-lexend',
     display: 'swap',
});

const lexendDeca = Lexend_Deca({
     weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
     subsets: ['latin'],
     variable: '--font-lexend-deca',
     display: 'swap',
});

const mulish = Mulish({
     subsets: ['latin'],
     variable: '--font-mulish',
     display: 'swap',
});

const quicksand = Quicksand({
     subsets: ['latin'],
     variable: '--font-quicksand',
     display: 'swap',
});






export default function SRootLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <html lang="en" className={`${inter.variable} ${roboto.variable} ${barlow.variable} ${rajdhani.variable} ${raleway.variable} ${robotoCondensed.variable} ${poppins.variable} ${montserrat.variable} ${openSans.variable} ${lato.variable} ${lexend.variable} ${lexendDeca.variable} ${mulish.variable} ${quicksand.variable}`} style={{ '--font-candara': 'Candara, sans-serif' } as React.CSSProperties}>
               <head></head>
               <body className={inter.className}>
                    <ThemeProvider>
                         <PrimeToast />
                         {children}
                    </ThemeProvider>
               </body>
          </html>
     );
}
