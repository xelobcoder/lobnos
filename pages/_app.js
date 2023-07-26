import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import '../styles/testpanel.css';
import '../styles/Frontpageside.css'
import "../styles/fullblood.css";
import '../styles/admin.css'
import '../styles/setup.css'
import '../styles/exceltable.css'
import Header from '../components/header'
// import SidebarFrontPage from '../components/frontpagesidebar';
import { AuthentificationProvider, AuthContext } from '../components/Auth/useAuthentification';
import { useContext } from 'react';
import MAIN_LAYOUT from '../components/Headers/Layout';


function MyApp({ Component, pageProps }) {
  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />)
  }
  
  return (
    <>
      <AuthentificationProvider>
        <Header />
        <MAIN_LAYOUT>
          <Component {...pageProps} />
        </MAIN_LAYOUT>
      </AuthentificationProvider>
    </>
  )
}

export default MyApp
