import ApplicationHeader from '../components/accessories/ApplicationHeader'
import { supplierSideBar } from '../Lib/supplierSidebar'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import "../node_modules/react-toastify/dist/ReactToastify.min.css"

function MyApp({ Component, pageProps: { pageProps } }) {

  // if (Component.getLayout) {
  //   return (
  //     <ApplicationProvider>
  //       Component.getLayout(<Component {...pageProps} />)
  //     </ApplicationProvider>)
  // }


  return (
    <ApplicationHeader sidebarLinks={supplierSideBar}>
      <Component {...pageProps} />
    </ApplicationHeader>
  )
}

export default MyApp

