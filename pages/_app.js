import'../styles/globals.css';
import '../styles/Frontpageside.css';
import '../styles/table.css';
import '../node_modules/react-toastify/dist/ReactToastify.min.css';
import { AuthentificationProvider } from '../components/Auth/useAuthentification';
import MAIN_LAYOUT from '../components/Headers/Layout';


function MyApp({ Component, pageProps: { pageProps } }) {
  import( '../node_modules/bootstrap/dist/css/bootstrap.min.css');
  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />)
  }

  return (
    <>
      <AuthentificationProvider>
        <MAIN_LAYOUT>
          <Component {...pageProps} />
        </MAIN_LAYOUT>
      </AuthentificationProvider>
    </>
  )
}

export default MyApp
