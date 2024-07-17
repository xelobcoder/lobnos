import React from 'react'
import OrganizatioBasic from '../../components/organization/BasicInfo';
import OrganizationWrapperLayout from '../../components/organization/OrganizationWrapperLayout';

export default function Index() {
  return (
    <>
      <OrganizationWrapperLayout>
        <OrganizatioBasic/>
      </OrganizationWrapperLayout>
    </>
  );
}
