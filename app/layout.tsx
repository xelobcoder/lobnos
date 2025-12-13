'use client';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../node_modules/react-datepicker/dist/react-datepicker.min.css'
import PrimeToast from "../components/accessories/PrimeToast";
import { ThemeProvider } from '../components/ThemeProvider';




export default function SRootLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <html lang="en">
               <body>
                    <ThemeProvider>
                         <PrimeToast />
                         {children}
                    </ThemeProvider>
               </body>
          </html>
     );
}
