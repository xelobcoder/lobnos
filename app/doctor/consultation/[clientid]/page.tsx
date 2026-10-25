'use client';
import {use} from 'react';
import ConsultationWorkbench from '../../../../components/Practitioner/ConsultationWorkbench';
export default function Page({params}:{params:Promise<{clientid:string}>}){const {clientid}=use(params);return <ConsultationWorkbench key={clientid} clientid={clientid}/>;}
