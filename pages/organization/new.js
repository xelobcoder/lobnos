import React from 'react'
import OrganizationWrapperLayout from '../../components/organization/OrganizationWrapperLayout';
import OrganizationNavigationalTabs from '../../components/organization/organizationalTabs';

export default function Index() {
  return (
    <>
      <OrganizationWrapperLayout>
        <OrganizationNavigationalTabs />
      </OrganizationWrapperLayout>
    </>
  );
}
