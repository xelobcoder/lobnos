import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import '../styles/testpanel.css';
import '../styles/Frontpageside.css'
import "../styles/fullblood.css";
import Header from '../components/header'
import SidebarFrontPage from '../components/frontpagesidebar';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { AuthentificationProvider } from '../components/Auth/useAuthentification';
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
          {/* <div>
            <SidebarFrontPage />
          </div> */}
          <Component {...pageProps} />
        </MAIN_LAYOUT>
      </AuthentificationProvider>
    </>
  )
}

export default MyApp
