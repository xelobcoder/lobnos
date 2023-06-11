import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CompanyHeaders from '../../components/ResultView/CompanyHeaders';
import CompanyFooter from '../../components/ResultView/CompanyFooter';
import { customFetch } from '../../components/Auth/customFetch';
import ChemistryTable from '../../components/ResultView/ChemistryTable';
import SamplingInformationResult from '../../components/ResultView/SamplingInformationResult';
import PersonalInformation from '../../components/ResultView/PersonalInformation';

export default function RESULT_FOR_PRINTING() {
  const [headers, setHeaders] = useState([])
  const { template, test, billingid, category } = useRouter().query;
  const [errorInDetails, setErrorInDetails] = useState(false);

  useEffect(() => {
    const getInformation = async function () {
      try {
        const getdata = await customFetch('settings/companyprofile');
        setHeaders(getdata)
      } catch (err) {
        alert('error in connecting to server')
      }
    }

    getInformation();
  }, [])

  return (
    <div className='result_page'>
      <div className='result'>
        <CompanyHeaders details={headers} />
        <PersonalInformation/>
        <SamplingInformationResult/>
        <ChemistryTable />
        <CompanyFooter details={headers} />
      </div>
    </div>
  )
}



RESULT_FOR_PRINTING.getLayout = function (page) {
  return (
    <>
      {page}
    </>
  )
}