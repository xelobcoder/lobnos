import '../styles/globals.css';
import '../styles/plsidebar.css';
import'../styles/content.css';
import '../styles/table.css';
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../styles/result.css';
import { AuthentificationProvider } from '../components/Auth/useAuthentification';
import MAIN_LAYOUT from '../components/Headers/Layout';
import { useEffect } from 'react';

function MyApp({ Component, pageProps: { pageProps } }) {
  useEffect(() => {
    require("../node_modules/bootstrap/dist/js/bootstrap.min");
    import ('../node_modules/react-datepicker/dist/react-datepicker.min.css')
  }, []);

  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />)
  }

  return (
    <AuthentificationProvider>
        <MAIN_LAYOUT>
          <Component {...pageProps} />
        </MAIN_LAYOUT>
    </AuthentificationProvider>
  )
}

export default MyApp

