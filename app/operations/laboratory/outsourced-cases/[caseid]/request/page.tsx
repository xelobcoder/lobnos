'use client';
import { use } from 'react';
import OutsourceRequest from '../../../../../../components/operations/OutsourceRequest';
export default function Page({params}:{params:Promise<{caseid:string}>}){const {caseid}=use(params);return <OutsourceRequest key={caseid} caseId={caseid}/>;}
