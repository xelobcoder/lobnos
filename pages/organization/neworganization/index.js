import { Box, Container } from '@mui/material';
import React, { useState } from 'react'
import OrganizatioBasic from '../../../components/organization/BasicInfo';
import ContactPerson from '../../../components/organization/ContactPerson';
import PaymentModule from '../../../components/organization/PaymentModule';

export default function Index() {
  const [event, setEvent] = useState('basicInfo');

  const changeEvent = (event) => setEvent(event)
  return (
    <>
      <Box className='org-tabs'>
        <li onClick={ () => changeEvent('basicInfo')}>basic information</li>
        <li onClick={ () => changeEvent('contact')}>contact person information</li>
        <li  onClick={ () => changeEvent('payment')}>payment module</li>
        <li>organizations</li>
      </Box>
      <Container>
        {event == 'basicInfo' && <OrganizatioBasic />}
        {event == 'contact' && <ContactPerson/>}
        {event == 'payment' && <PaymentModule/>}
      </Container>
    </>
  )
}
