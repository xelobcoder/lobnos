import '../styles/globals.css'
import '../styles/wizard.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Header from '../components/header'
import Footer from '../components/footer'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header/>
      <Component {...pageProps} />
      <Footer/>
    </>

  )
}

export default MyApp
