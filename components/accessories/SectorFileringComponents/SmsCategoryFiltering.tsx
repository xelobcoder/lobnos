import React from 'react'
import PatientFiltered from './CustomerFiltering';
import OutsourceOrganizationFiltering from './OutsourceOrganizationFiltering';
import OrganizationFiltering from './OrganizationFiltering';
import ClinicianFiltering from './ClinicianFiltering';
import StaffsFiltering from './StaffFiltering';

export default function SmsCategoryFiltering({ category, onSelect }: {
     category: string,
     onSelect: (value: any) => void
}) {
     const rendering = () => {
          if (category == "clients") return <PatientFiltered getSelectedPatient={onSelect} isDisabled={false} />
          else if (category === "outsourcing") return <OutsourceOrganizationFiltering onSelect={onSelect} />
          else if (category == "organization") return <OrganizationFiltering onSelect={onSelect} />
          else if (category == "clinicians") return <ClinicianFiltering onSelect={onSelect} />
          else if (category == "staffs") return <StaffsFiltering onSelect={onSelect} />
          else {
               return null;
          }
     }

     console.log(category)
     return (
          <div>
               {rendering()}
          </div>
     )
}
