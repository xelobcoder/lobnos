import { Box, Button, Container, Typography } from '@mui/material';
import React, { useState } from 'react'
import OrganizatioBasic from '../../../components/organization/BasicInfo';
import ContactPerson from '../../../components/organization/ContactPerson';
import PaymentModule from '../../../components/organization/PaymentModule';
import { useRouter } from 'next/router';
import ImageView from '../../../components/organization/ImageView';
import SecondOrgNav from '../../../components/organization/SecondOrgNav';
import { validateFormData } from '../../../components/Auth/customFetch';

export default function Index() {
  const navigation = useRouter();

  const defaultData = {
    module: '',
    commission: '',
    momo: '',
    bankName: '',
    accountName: '',
    branch: '',
    account: '',
    person: '',
    email: '',
    contactPerson: '',
    contactEmail: '',
    name: '',
    location: '',
    street: '',
    mobile: '',
    address: '',
    website: '',
    email: '',
    gpsMapping: '',
    region: '',
    district: ''
  }


  const [data, setData] = useState(defaultData);

  const handleChange = (event, target) => {
    const { value } = event.target;
    setData({ ...data, [target]: value })
  }

  const handleSubmit = async (event) => {
    const callResponse = function (response) {
      console.log(response)
    }

    console.log(data)

    await validateFormData(data, false, ['name', 'location', 'street', 'mobile', 'address', 'eamil', 'contactPerson'], 'new/organizations', callResponse)
  }

  const changeRoute = function () {
    navigation.push('/organization')
  }

  return (
    <>
      <SecondOrgNav router={changeRoute} />
      <div className="organization">
        <div className="sectionWrapper">
          <div className="organization-section">
            <Typography variant="h5" className="mb-2">
              Basic Infomation
            </Typography>
            <OrganizatioBasic data={data} handleChange={handleChange} />
          </div>
        </div>
        <div>
          <div className="organization-section">
            <Typography variant="h5" className="mb-2">
              Contact Person
            </Typography>
            <ContactPerson data={data} handleChange={handleChange} />
          </div>
          <div className="organization-section">
            <Typography variant="h5" className="mb-2">
              Payment Module
            </Typography>
            <PaymentModule handleSubmit={handleSubmit} data={data} handleChange={handleChange} />
          </div>
        </div>
        <div className="imageview">
          <ImageView />
        </div>
      </div>
    </>
  );
}
