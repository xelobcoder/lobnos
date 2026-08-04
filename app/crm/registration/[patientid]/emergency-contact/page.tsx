"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EmmergencyContactInformation from '../../../../../components/registration/EmmergencyContactInformation';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { registrationFields } from '../../../../../components/registration/fields/Util';
import { toast } from 'react-toastify';

export default function PageEmergencyContact() {
     const { patientid } = useParams();
     const id = patientid ? Number(patientid) : undefined;
     const [defaultData, setDefaultData] = useState<any>({});
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          if (!id) {
               setLoading(false);
               return;
          }

          const fetchData = async () => {
               try {
                    const response = await customFetch(`register/emmergencycontactinformation?patientid=${id}`);
                    if (response && Number(response.statusCode) === 200 && response.status === "success" && response.result && Object.keys(response.result).length > 0) {
                         setDefaultData(response.result || {});
                    }
               } catch (error) {
                    console.error('Failed to load emergency contact information', error);
                    setDefaultData({});
               } finally {
                    setLoading(false);
               }
          };

          fetchData();
     }, [id]);

     if (loading) {
          return <div className="container-fluid px-4 py-3">Loading emergency contact information...</div>;
     }

     if (!id) {
          return <div className="container-fluid px-4 py-3">No patient selected.</div>;
     }

     return (
          <div className="container-fluid px-4 py-3">
               <EmmergencyContactInformation
                    toast={toast}
                    patientid={id}
                    defaultData={defaultData}
                    fields={registrationFields.emmergencyInformation}
               />
          </div>
     );
}
