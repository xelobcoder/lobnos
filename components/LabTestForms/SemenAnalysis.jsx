import { Typography, Autocomplete, TextField } from '@mui/material'
import React, { useState, useEffect } from 'react'
import defaultData from './semenAnalysisDefaultData';
import Indicator from '../accessories/Reports/indicator';
import CommentSection from './commentSection';
import { customFetch, handleComments, handleResponse, validateFormData } from '../Auth/customFetch';

export default function SemenAnalysis({ clientdata }) {
  // destucturing client data
  const { billingid, patientid, test, testid } = clientdata;
  // result state
  const [result, setResult] = useState(defaultData);
  const [resultEntered, setResultEntered] = useState(false);



  const handleResult = async () => {
    await validateFormData({ ...result, billingid, testid, testname: test, patientid }, true, [], 'test/result/enter', handleResponse);
  }


  // we check if result was previously entered or not
  useEffect(() => {
    const checkResult = async () => {
      const response = await customFetch(`test/result/check?billingid=${billingid}&testname=${test}`);
      const { statusCode, result, records } = response;
      if (statusCode == 200 && result) {
        setResultEntered(true)
        // parse the collection date and time
        const { collectionDate, ...rest } = records[0];
        // new date object
        const date = collectionDate.split('T')[0];
        // set result state
        setResult({ ...rest, collectionDate:date})
      }

    }
    checkResult()
  }, [])


  return (
    <>
      {/* we will be collecting time of collection,
     time of liquefaction,
     abstinence,quantity  and colour, consistency */}
      <div className='mx-3'>
        <div className='card'>
          <div className='card-header'>
            <h5>Semen Analysis</h5>
          <Indicator resultEntered={resultEntered} />
          </div>
          <div className='card-body'>
          <form className='bg-white p-3'>
          {/* collectionDate */}
          <div className='form-row'>
            <label className='col-form-label'>Date of Collection</label>
            <div className='col-sm-12'>
              <input type='date' className='custom-input'
                onChange={(e) => setResult({ ...result, collectionDate: e.target.value })}
                value={result.collectionDate}
              />
            </div>
          </div>

          {/* time of collection */}
          <div className='form-row'>
            <label className='col-sm-12 col-form-label'>Time of Collection</label>
            <div className='col-sm-12'>
              <input type='time' className='custom-input' placeholder='12:30 pm'
                onChange={(e) => setResult({ ...result, collectionTime: e.target.value })}
                value={result.collectionTime}
              />
            </div>
          </div>
          {/* time of liquefaction */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Time of Liquefaction</label>
            <div className='col-sm-12'>
              <input type='text' className='custom-input' placeholder='19 min'
                onChange={(e) => setResult({ ...result, liquefactionTime: e.target.value })}
                value={result.liquefactionTime}
              />
            </div>
          </div>
          {/* abstinence */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Abstinence</label>
            <div className='col-sm-12'>
              <input type='text' className='custom-input'
                onChange={(e) => setResult({ ...result, abstinence: e.target.value })}
                value={result.abstinence}
                placeholder='3 days' />
            </div>
          </div>
          {/* quantity */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Quantity</label>
            <div className='col-sm-12'>
              <input type='text' className='custom-input'
                onChange={(e) => setResult({ ...result, quantity: e.target.value })}
                value={result.quantity}
                placeholder='3.5 ml' />
            </div>
          </div>
          {/* colour */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Colour</label>
            <div className='col-sm-12'>
              <input type='text'
                onChange={(e) => setResult({ ...result, colour: e.target.value })}
                value={result.colour}
                className='custom-input' placeholder='Greyish white' />
            </div>
          </div>
          {/* consistency */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Consistency</label>
            <div className='col-sm-12'>
              <input type='text'
                onChange={(e) => setResult({ ...result, consistency: e.target.value })}
                value={result.consistency}
                className='custom-input' placeholder='Viscous' />
            </div>
          </div>
          <Typography variant='h5' className='mt-3'>
            Chemical Examination
          </Typography>
          {/* ph */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>pH</label>
            <div className='col-sm-12'>
              <input type='number' step='0.1' max={14} min={0}
                onChange={(e) => setResult({ ...result, ph: e.target.value })}
                value={result.ph}
                className='custom-input' placeholder='7.2' />
            </div>
          </div>
          {/* fructose */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Fructose</label>
            <div className='col-sm-12'>
              <input type='text'
                onChange={(e) => setResult({ ...result, fructose: e.target.value })}
                value={result.fructose}
                className='custom-input' placeholder='Positive' />
            </div>
          </div>
          {/* microscopic examination */}
          <Typography variant='h5' className='mt-3'>
            Microscopic Examination
          </Typography>
          {/* sperm count */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Sperm Count
              (in million) </label>
            <div className='col-sm-12'>
              <input type='text' className='custom-input'
                onChange={(e) => setResult({ ...result, spermCount: e.target.value })}
                value={result.spermCount}
                placeholder='60 million/ml' />
            </div>
            {/* reference range */}
            <span>
              <Typography variant='caption' className='mt-3' color={'primary'}>
                Reference Range: 20-150 million/ml
              </Typography>
            </span>
          </div>
          {/* motility */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Motility(in %)</label>
            <div className='col-sm-12'>
              <input type='text'
                onChange={(e) => setResult({ ...result, motility: e.target.value })}
                value={result.motility}
                className='custom-input' placeholder='60%' />
            </div>
            {/* reference range */}
            <span>
              <Typography variant='caption' className='mt-3' color={'primary'}>
                Reference Range: greater than 60%
              </Typography>
            </span>
          </div>
          {/* motility grade */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Motility Grade</label>
            <div className='col-sm-12'>
              <Autocomplete

                options={['Grade I(immotile)', 'Grade II(non-progressive motility)', 'Grade III(slow progressive motility)', 'Grade IV(fast progressive motility)']}
                onChange={(e, value) => setResult({ ...result, motilityGrade: value })}
                getOptionLabel={(option) => option}
                value={result.motilityGrade}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    size='small'
                    label='Motility Grade'
                    placeholder='Motility Grade'
                  />
                )}
              />

            </div>

          </div>
          {/* RBC */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>RBC</label>
            <div className='col-sm-12'>
              <Autocomplete
                options={['absent', 'present']}
                onChange={(e) => setResult({ ...result, rbcs: e.target.value })}
                value={result.rbcs}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    size='small'
                    label='RBC'
                    placeholder='RBC'
                  />
                )}
              />
            </div>
          </div>
          {/* pus cells */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Pus Cells</label>
            <div className='col-sm-12'>
              <Autocomplete
                onChange={(e) => setResult({ ...result, pusCells: e.target.value })}
                value={result.pusCells}
                options={['absent', 'present']}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    size='small'
                    label='Pus Cells'
                    placeholder='Pus Cells'
                  />
                )}
              />
            </div>
          </div>
          {/* epithelial cells */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Epithelial Cells</label>
            <div className='col-sm-12'>
              <Autocomplete
                options={['absent', 'present']}
                onChange={(e) => setResult({ ...result, epithelialCells: e.target.value })}
                value={result.epithelialCells}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    size='small'
                    label='Epithelial Cells'
                    placeholder='Epithelial Cells'
                  />
                )}
              />
            </div>
          </div>
          {/* morphology */}
          <div className='form-row'>
            <label className='col-sm-2 col-form-label'>Morphology</label>
            <div className='col-sm-12'>
              <Autocomplete
                onChange={(e) => setResult({ ...result, morphology: e.target.value })}
                value={result.morphology}
                options={['Normal', 'Abnormal']}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    size='small'
                    label='Morphology'
                    placeholder='Morphology'
                  />
                )}
              />
            </div>
          </div>
        </form>
        <CommentSection target={'impression'}
          comment={result.impression}
          getcomment={handleComments}
          value={result.impression}
          datafunction={setResult}
          datasource={result}
            />
         <button type='button' className='btn btn-primary btn-sm mx-2' onClick={handleResult}>
          Save Result
        </button>
          </div>
       </div>
      </div>
    </>
  )
}
