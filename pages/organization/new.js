import React from 'react'
import OrganizationWrapperLayout from '../../components/organization/OrganizationWrapperLayout';
import OrganizationBasicForm from '../../components/organization/BasicOrganizationForm';

export default function Index() {
  return (
    <>
      <OrganizationWrapperLayout>
        <OrganizationBasicForm />
      </OrganizationWrapperLayout>
    </>
  );
}
