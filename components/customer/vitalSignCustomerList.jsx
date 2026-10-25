'use client';
import VitalSigns from '../Practitioner/VitalSigns';
export default function VitalSignCustomerListInformation({searchParams}){return <VitalSigns patientid={Number(searchParams.patientid)} readOnly/>;}
