'use client';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../node_modules/react-datepicker/dist/react-datepicker.min.css'
import PrimeToast from "../components/accessories/PrimeToast";




export default function SRootLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <html lang="en">
               <head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
               </head>
               <body>
                    <PrimeToast />
                    {children}
               </body>
          </html>
     );
}
