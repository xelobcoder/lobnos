import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import CompanyHeaders from '../../components/ResultView/CompanyHeaders';
import CompanyFooter from '../../components/ResultView/CompanyFooter';
import { customFetch } from '../../components/Auth/customFetch';
import ChemistryTable from '../../components/ResultView/ChemistryTable';
import SamplingInformationResult from '../../components/ResultView/SamplingInformationResult';
import PersonalInformation from '../../components/ResultView/PersonalInformation';
import HemaSingle from '../../components/ResultView/HemaSingle';

export default function RESULT_FOR_PRINTING() {
  const [headers, setHeaders] = useState([]);
  const [result, setResult] = useState([]);
  const [sampling, setSampling] = useState([])
  const [category,setCategory] = useState(null);
  const { template, testid, test, billingid, preview = false } = useRouter().query;
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


  useEffect(() => {
    async function getData() {
      const response = await customFetch(`result/preview?billingid=${billingid}&&testid=${testid}&&test=${test}&&category=${category}`);
      const { result, sampling,testcategory} = response;
      setResult(result);
      setSampling(sampling);
      setCategory(testcategory)
      console.log(response)
    }
    getData();
  }, [billingid, testid, test, category])

  return (
    <div className='result_page'>
      <div className='result'>
        <CompanyHeaders details={headers} />
        <PersonalInformation data={sampling} />
        <SamplingInformationResult data={sampling} />
        {category == 'chemistry' && <ChemistryTable data={result} testname={test} />}
        {category == 'hema' && <HemaSingle  result={result || [] } testname={test}/>}
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