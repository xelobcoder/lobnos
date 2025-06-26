import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { RiMoreFill } from '@remixicon/react';

const CustomersActions = ({ item, callActivation, gotoPrevTrans, toast, router, handleBilling }) => {
     return (
          <Dropdown>
               <Dropdown.Toggle variant="light"  id="archives-dropdown" style={{zIndex:9999,height:'auto'}}>
               <RiMoreFill size={24} />
               </Dropdown.Toggle>
               <Dropdown.Menu className="m-0 p-0 bg-white">
                    <Dropdown.Item className='text-capitalize' onClick={() => callActivation(item.activation_status, item.patientid, toast)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M7 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C14.7405 2 17.1131 3.5748 18.2624 5.86882L16.4731 6.76344C15.6522 5.12486 13.9575 4 12 4C9.23858 4 7 6.23858 7 9V10ZM5 12V20H19V12H5ZM10 15H14V17H10V15Z"></path>
                         </svg> Activate Client
                    </Dropdown.Item>
                    <Dropdown.Item className='text-capitalize' onClick={() => callActivation(item.activation_status, item.patientid, toast)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M19 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9V10ZM5 12V20H19V12H5ZM11 14H13V18H11V14ZM17 10V9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9V10H17Z"></path>
                         </svg> Deactivate Client
                    </Dropdown.Item>
                    <Dropdown.Item className='text-capitalize' onClick={() => router.push(`/registration?patientid=${item.patientid}`)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M14 14.252V16.3414C13.3744 16.1203 12.7013 16 12 16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18.5858 17L16.7574 15.1716L18.1716 13.7574L22.4142 18L18.1716 22.2426L16.7574 20.8284L18.5858 19H15V17H18.5858Z"></path>
                         </svg> Update Records
                    </Dropdown.Item>
                    <Dropdown.Item className='text-capitalize' onClick={() => handleBilling(item)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M3.00488 3.00275H21.0049C21.5572 3.00275 22.0049 3.45046 22.0049 4.00275V20.0027C22.0049 20.555 21.5572 21.0027 21.0049 21.0027H3.00488C2.4526 21.0027 2.00488 20.555 2.00488 20.0027V4.00275C2.00488 3.45046 2.4526 3.00275 3.00488 3.00275ZM4.00488 5.00275V19.0027H20.0049V5.00275H4.00488ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.00275 10.0049 8.00275H11.0049V6.00275H13.0049V8.00275H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z"></path>
                         </svg> Bill Client
                    </Dropdown.Item>
                    <Dropdown.Item className='text-capitalize' onClick={() => window.open(`/appointments/book?patientid=${item.patientid}`)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M21 4H7C5.89543 4 5 4.89543 5 6C5 7.10457 5.89543 8 7 8H21V21C21 21.5523 20.5523 22 20 22H7C4.79086 22 3 20.2091 3 18V6C3 3.79086 4.79086 2 7 2H20C20.5523 2 21 2.44772 21 3V4ZM5 18C5 19.1046 5.89543 20 7 20H19V10H7C6.27143 10 5.58835 9.80521 5 9.46487V18ZM20 7H7C6.44772 7 6 6.55228 6 6C6 5.44772 6.44772 5 7 5H20V7Z"></path>
                         </svg> Book Appointment
                    </Dropdown.Item>
                    <Dropdown.Item className='text-capitalize' onClick={() => window.open(`/customers/recordVitalSigns?patientid=${item.patientid}`)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M12 4C10.1 4 8.4 5.4 8 7.2C8.3 7.1 8.7 7 9 7C10.2 7 11 7.8 11 9C11 10.2 10.2 11 9 11H8C6.3 11 5 12.3 5 14C5 15.7 6.3 17 8 17H10C11.7 17 13 15.7 13 14V12C13 10.3 11.7 9 10 9H9C9 8.3 9.4 8 10 8C10.6 8 11 8.4 11 9C11 9.6 10.6 10 10 10C9.4 10 9 10.4 9 11V12C9 12.6 9.4 13 10 13H11C12.1 13 13 13.9 13 15C13 16.1 12.1 17 11 17H10C9.6 17 9 17.4 9 18C9 18.6 9.4 19 10 19H11C12.1 19 13 19.9 13 21C13 22.1 12.1 23 11 23H7C5.9 23 5 22.1 5 21V19H3V21C3 22.1 3.9 23 5 23H11C12.1 23 13 22.1 13 21C13 19.9 12.1 19 11 19H10C9.6 19 9 18.4 9 18C9 17.4 9.4 17 10 17H11C12.1 17 13 16.1 13 15C13 14.2 12.8 13.5 12.5 12.8C12.9 12.5 13.4 12.2 14 12C14.6 11.8 15.2 11.5 15.6 11C16.2 10.5 17 9.7 17 9C17 7.9 16 7 14.5 7C14 7 13.5 7.1 13.2 7.3C12.9 7.5 12.5 7.8 12 8H12C11.5 7.8 11.1 7.5 10.8 7.3C10.5 7.1 10 7 9.5 7C9 7 8.3 7.4 8 8C8.7 6.9 10.1 5.8 12 5.5V4H12Z"></path>
                         </svg> Record Vital Signs
                    </Dropdown.Item>
                    <Dropdown.Item className='text-capitalize' onClick={() => gotoPrevTrans(item.patientid)}>
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                              <path d="M19 1H5C3.89543 1 3 1.89543 3 3V21C3 22.1046 3.89543 23 5 23H19C20.1046 23 21 22.1046 21 21V3C21 1.89543 20.1046 1 19 1ZM19 21H5V3H19V21ZM9 17H15V19H9V17ZM11 7C11 7.553 10.553 8 10 8C9.447 8 9 7.553 9 7C9 6.447 9.447 6 10 6C10.553 6 11 6.447 11 7Z"></path>
                         </svg>
                         Previous Transactions
                    </Dropdown.Item>
               </Dropdown.Menu>
          </Dropdown>
     );
};

export default CustomersActions;
