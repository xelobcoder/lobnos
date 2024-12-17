import '../styles/globals.css';
import '../styles/plsidebar.css';
import '../styles/content.css';
import '../styles/table.css';
import '../styles/result.css';
import '../styles/side.css';
import '../styles/prime-table.css'
import '../styles/mediaqueries.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { ApplicationProvider } from '../components/Auth/useApplicationContext';
import { useEffect } from 'react';

function MyApp({ Component, pageProps: { pageProps } }) {

  useEffect(() => {
    import('../node_modules/react-datepicker/dist/react-datepicker.min.css');
    import('../node_modules/react-toastify/dist/ReactToastify.min.css');
  }, [])

  if (Component.getLayout) {
    return (<ApplicationProvider>Component.getLayout(<Component {...pageProps} />)</ApplicationProvider>)
  }


  return (
    <ApplicationProvider>
      <Component {...pageProps} />
    </ApplicationProvider>
  )
}

export default MyApp

