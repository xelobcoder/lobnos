import '../styles/globals.css';
import '../styles/plsidebar.css';
import'../styles/content.css';
import '../styles/table.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../styles/result.css';
import { AuthentificationProvider } from '../components/Auth/useAuthentification';
import MAIN_LAYOUT from '../components/Headers/Layout';
import { useEffect } from 'react';

function MyApp({ Component, pageProps: { pageProps } }) {

  useEffect(() => {
    import('../node_modules/react-datepicker/dist/react-datepicker.min.css')
  }, [])

  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />)
  }


<<<<<<< HEAD
=======

>>>>>>> a236a112f54655a5e56c87b3b870b8ab41af3bf4
  return (
    <AuthentificationProvider>
        <MAIN_LAYOUT>
          <Component {...pageProps} />
        </MAIN_LAYOUT>
    </AuthentificationProvider>
  )
}

export default MyApp

