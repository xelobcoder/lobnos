import { Box, Button, Container, Typography } from '@mui/material';
import React, { useState } from 'react'
import OrganizatioBasic from '../../../components/organization/BasicInfo';
import ContactPerson from '../../../components/organization/ContactPerson';
import PaymentModule from '../../../components/organization/PaymentModule';
import { useRouter } from 'next/router';
import ImageView from '../../../components/organization/ImageView';
import SecondOrgNav from '../../../components/organization/SecondOrgNav';
import { customPost, validateFormData, validateMobileNumber } from '../../../components/Auth/customFetch';

export default function Index() {
  const navigation = useRouter();
  const [file, setFile] = useState(null);

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
    const formdata = new FormData()

    formdata.append('file', file);

    const callResponse = async function (response) {
      // alert message to client
      const { statusCode, message, organizationId, status } = response;
      if (statusCode == 201 && status == 'success') {
        try {
          const response = await fetch(`${process.env.BASEURL}/new/organization/images?imageid=${organizationId}`, {
            method: 'POST',
            body: formdata,
          });

          if (response.ok) {
            alert(message);
          } else {
            console.error('Error uploading file:', response.statusText);
            alert('Error uploading file:', response.statusText)
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }

      if (statusCode == 201 && status == 'exist') {
        alert(message)
      }
    }




    // validate phone numbers of the organization and the contact person

    const validateContact = await validateMobileNumber(data.contactPerson, 10);
    const validateOrg = await validateMobileNumber(data.momo, 10);
    const validateMobile = await validateMobileNumber(data.mobile, 10);



    if (validateContact && validateMobile && validateOrg) {
      await validateFormData(data, false, ['name', 'location', 'street', 'mobile', 'address', 'eamil', 'contactPerson'], 'new/organizations', callResponse)
    } else {
      alert('Check phone numbers to ensure length is 10 and start  with 0')
    }
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
          <ImageView handleFile={setFile} />
        </div>
      </div>
    </>
  );
}
