import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useRouter } from 'next/router';

export default function EditUserInformation() {
  const router = useRouter();
  const { user } = router.query;
  return (
    <div>
      <div className='card m-4' style={{ borderRadius: '5px' }}>
        <div className='card-header d-flex'>
          <h6 className='text-capitalize btn btn-danger text-white'>Update user information</h6>
        </div>
        <div className='card-body p-0'>
          <Tabs
            defaultActiveKey="profile"
            id="uncontrolled-tab-example"
            className="mb-4 "
          >
            <Tab eventKey="home" title="update personal information">
              Tab content for Home
            </Tab>
            <Tab eventKey="profile" title="educational hsitory">
              Tab content for Profile
            </Tab>
            <Tab eventKey="contact" title="geographyical location" >
              Tab content for Contact
            </Tab>
            <Tab eventKey="experience" title="Work Experience" >
              Tab content for Contact
            </Tab>
          </Tabs>
        </div>
        <div className='card-footer'>

        </div>
      </div>
    </div>
  )
}
