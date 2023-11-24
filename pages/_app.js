import ('../styles/globals.css');
import ('../styles/Frontpageside.css')
import Header from '../components/header'
import { AuthentificationProvider } from '../components/Auth/useAuthentification';
import MAIN_LAYOUT from '../components/Headers/Layout';
import { useEffect } from 'react';



function MyApp({ Component, pageProps: { pageProps } }) {
  useEffect(() => {
    import('../node_modules/react-toastify/dist/ReactToastify.css');
    import ('../node_modules/bootstrap/dist/css/bootstrap.min.css');
  }, [])
  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />)
  }

  return (
    <>
      <AuthentificationProvider>
        <MAIN_LAYOUT>
          <Header />
          <Component {...pageProps} />
        </MAIN_LAYOUT>
      </AuthentificationProvider>
    </>
  )
}

export default MyApp
