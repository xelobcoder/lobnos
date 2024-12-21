import React from 'react'
import PatientFiltered from './CustomerFiltering';
import OutsourceOrganizationFiltering from './OutsourceOrganizationFiltering';
import OrganizationFiltering from './OrganizationFiltering';

export default function SmsCategoryFiltering({ category }: {
     category: string
}) {
     return (
          <div>
               <PatientFiltered />
               <br />
               <OutsourceOrganizationFiltering />
               <br />
               <OrganizationFiltering/>
          </div>
     )
}
