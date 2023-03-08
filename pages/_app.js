// import Document from './_document';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import '../styles/testpanel.css';
import '../styles/Frontpageside.css'
import "gridjs/dist/theme/mermaid.css";
// import "../styles/lobnos.css";
import "../styles/fullblood.css";
// import "../styles/table.css";

import Header from '../components/header'
import Footer from '../components/footer';
import SidebarFrontPage from '../components/frontpagesidebar';



function MyApp({ Component, pageProps }) {
  if (Component.getLayout) {
    return Component.getLayout(<Component {...pageProps} />)
  }
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main" >
         <Component {...pageProps}/>
        </div>
      </div>
    </>
  )
}

export default MyApp
