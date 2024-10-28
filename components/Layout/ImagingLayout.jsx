import { AnalyticsSharp, ProductionQuantityLimits, Queue } from '@mui/icons-material'
import AppCustomLayout from './CustomLayout'


const ImagingApplicationLinks = [
       { title: 'Waiting List', link: '/operations/imaging/ultrasound', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 16V20H8V22H2V16H4ZM22 16V22H16V20H20V16H22ZM7.5 7C7.5 9.1416 8.99603 10.9338 11 11.3885L11 17H13L13.001 11.3883C15.0045 10.9332 16.5 9.14125 16.5 7H18.5C18.5 9.50729 17.0804 11.683 15.0011 12.7672L15 19H9L8.99992 12.7677C6.92007 11.6837 5.5 9.50769 5.5 7H7.5ZM12 5C13.3807 5 14.5 6.11929 14.5 7.5C14.5 8.88071 13.3807 10 12 10C10.6193 10 9.5 8.88071 9.5 7.5C9.5 6.11929 10.6193 5 12 5ZM8 2V4L4 3.999V8H2V2H8ZM22 2V8H20V4H16V2H22Z"></path></svg> },
       { title: 'Processed List', link: '/operations/imaging/ultrasound/processedlist', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9.82986 8.78986L7.99998 9.45588V13H5.99998V8.05H6.015L11.2834 6.13247C11.5274 6.03855 11.7922 5.99162 12.0648 6.0008C13.1762 6.02813 14.1522 6.75668 14.4917 7.82036C14.678 8.40431 14.848 8.79836 15.0015 9.0025C15.9138 10.2155 17.3653 11 19 11V13C16.8253 13 14.8823 12.0083 13.5984 10.4526L12.9008 14.4085L15 16.17V23H13V17.1025L10.7307 15.1984L10.003 19.3253L3.10938 18.1098L3.45667 16.1401L8.38071 17.0084L9.82986 8.78986ZM13.5 5.5C12.3954 5.5 11.5 4.60457 11.5 3.5C11.5 2.39543 12.3954 1.5 13.5 1.5C14.6046 1.5 15.5 2.39543 15.5 3.5C15.5 4.60457 14.6046 5.5 13.5 5.5Z"></path></svg> },
       { title: 'Analytics', link: '/operations/imaging/ultrasound/analytics', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M9 2.4578V4.58152C6.06817 5.76829 4 8.64262 4 12C4 16.4183 7.58172 20 12 20C15.3574 20 18.2317 17.9318 19.4185 15H21.5422C20.2679 19.0571 16.4776 22 12 22C6.47715 22 2 17.5228 2 12C2 7.52236 4.94289 3.73207 9 2.4578ZM12 2C17.5228 2 22 6.47715 22 12C22 12.3375 21.9833 12.6711 21.9506 13H11V2.04938C11.3289 2.01672 11.6625 2 12 2ZM13 4.06189V11H19.9381C19.4869 7.38128 16.6187 4.51314 13 4.06189Z"></path></svg> },
       { title: 'create Templates', link: '/operations/imaging/ultrasound/templates', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM11 11V7H13V11H17V13H13V17H11V13H7V11H11Z"></path></svg> },
       { title: 'Ultrasound Templates', link: '/operations/imaging/ultrasound/templates/list', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5ZM11 11V7H13V11H17V13H13V17H11V13H7V11H11Z"></path></svg> }

]


export default function UltrasoundLayout({ children }) {
       return (
              <AppCustomLayout sideLinks={ImagingApplicationLinks}>
                     {children}
              </AppCustomLayout>
       )
}
