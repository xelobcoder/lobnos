import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../node_modules/react-datepicker/dist/react-datepicker.min.css'




export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <html lang="en">
               <body >
                   {children}
               </body>
          </html>
     );
}
