import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import CompanyHeaders from '../../components/ResultView/CompanyHeaders';
import CompanyFooter from '../../components/ResultView/CompanyFooter';
import { customFetch, getCompanyInformation, readyToPrint } from '../../components/Auth/customFetch';
import ChemistryTable from '../../components/ResultView/ChemistryTable';
import SamplingInformationResult from '../../components/ResultView/SamplingInformationResult';
import PersonalInformation from '../../components/ResultView/PersonalInformation';
import HemaSingle from '../../components/ResultView/HemaSingle';
import { Button } from '@mui/material';

export default function RESULT_FOR_PRINTING() {
  const [headers, setHeaders] = useState([]);
  const [result, setResult] = useState([]);
  const [sampling, setSampling] = useState([])
  const [category, setCategory] = useState(null);
  const { template, testid, test, billingid, preview = false } = useRouter().query;
  const [errorInDetails, setErrorInDetails] = useState(false);

  useEffect(() => {
    getCompanyInformation(setHeaders);
  }, [])


  useMemo(() => {
    try {
      async function getData() {
        if (billingid && test && testid) {
          const response = await customFetch(`result/preview?billingid=${billingid}&&testid=${testid}&&test=${test}&&category=${category}`);
          const { result, sampling, testcategory } = response;
          setResult(result);
          setSampling(sampling);
          setCategory(testcategory)
        }
      }
      getData();
    }
    catch (err) {
      console.log(err)
    }
  }, [billingid, category, test, testid])

  useEffect(() => {
    const handleKeyPress = async function (event) {
      if (event.ctrlKey && event.key === 'p') {
        await readyToPrint(billingid, testid);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  })




  return (
    <div className='result_page'>
      <div className='result'>
        <CompanyHeaders details={headers} />
        <PersonalInformation data={sampling} />
        <SamplingInformationResult data={sampling} />
        {category == 'chemistry' && <ChemistryTable data={result} testname={test} />}
        {category == 'hema' && <HemaSingle result={result || []} testname={test} />}
        <CompanyFooter details={headers} />
        
      </div>
      <div className='print-section'>
        <Button
          sx={{ position: 'absolute', top: '10%', left: '10%' }}
          variant='contained' size='large' color='success' onClick={() => readyToPrint(billingid, testid)}>
          print
        </Button>
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