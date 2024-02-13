import  { useContext, useState } from 'react';
import OperationsContext from '../../components/operations/OperationsContext';
import PatientTrendModalJsx from './PatientTrendModalJsx/PatientTrendModal.jsx';
import { getTestComponent } from '../LabTestForms/ComponentsTestFormsList.js';

export default function DisplayTest() {
  const { operationsKey, employeeid } = useContext(OperationsContext);
  const [showtrend, setshowtrend] = useState(false);
  const closeTrend = () => { setshowtrend(false) }

  let Component = operationsKey?.test ? getTestComponent(operationsKey?.test.toLowerCase()) : <h1>Null</h1>


  return (
    <>
      <div>
        {operationsKey?.display &&
          (<div className='d-flex justify-content-end mx-1 my-1 gap-1 pointer '>
          {/* <button onClick={(ev) => { setshowtrend(true) }} className='btn btn-primary btn-sm'>
            <span className='mx-2'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-graph-up-arrow" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5" />
              </svg>
            </span>
            Patient Trend
          </button>
          {showtrend && ( <PatientTrendModalJsx show={showtrend} hide={closeTrend} data={operationsKey} />)} */}
        </div>)}
        {operationsKey?.display ? <Component employeeid={employeeid}   clientdata={operationsKey} /> :
          <>
        <div className='d-flex justify-content-center m-4 '>
          <div>
                <div className='d-flex justify-content-center'>
                <svg width="200px" height="200px" viewBox="-102.4 -102.4 1228.80 1228.80" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="204.8"><path d="M227.7 180.4h455.2v22.8H227.7z" fill="#446EB1"></path><path d="M666 196.6l17-16.2 136.4 159.4-17 16.2L666 196.6zM227.7 203.2h22.8V795h-22.8z" fill="#446EB1"></path><path d="M250.5 203.2v594.7h546.2V363.3H660.2V203.2H250.5z" fill="#E1F0FF"></path><path d="M796.7 339.7h22.8v455.2h-22.8zM227.7 794.9h591.8v22.8H227.7z" fill="#446EB1"></path><path d="M500.8 430.8h204.8v22.8H500.8zM341.5 521.8h364.2v22.8H341.5zM341.5 612.9h364.2v22.8H341.5zM341.5 703.9h364.2v22.8H341.5z" fill="#6D9EE8"></path><path d="M660.2 203.2H683v159.3h-22.8z" fill="#446EB1"></path><path d="M682.9 339.7h113.8v22.8H682.9zM442.3 277.3h15.3L440 347.7l-22.8-99h-36.6l-26.5 99-19.9-99H296L334.8 408h37.4l26.2-94.2 23.4 94.2h34.5l44.5-159.3h-58.6v28.6h0.1z" fill="#446EB1"></path></g><g id="SVGRepo_iconCarrier"><path d="M227.7 180.4h455.2v22.8H227.7z" fill="#446EB1"></path><path d="M666 196.6l17-16.2 136.4 159.4-17 16.2L666 196.6zM227.7 203.2h22.8V795h-22.8z" fill="#446EB1"></path><path d="M250.5 203.2v594.7h546.2V363.3H660.2V203.2H250.5z" fill="#E1F0FF"></path><path d="M796.7 339.7h22.8v455.2h-22.8zM227.7 794.9h591.8v22.8H227.7z" fill="#446EB1"></path><path d="M500.8 430.8h204.8v22.8H500.8zM341.5 521.8h364.2v22.8H341.5zM341.5 612.9h364.2v22.8H341.5zM341.5 703.9h364.2v22.8H341.5z" fill="#6D9EE8"></path><path d="M660.2 203.2H683v159.3h-22.8z" fill="#446EB1"></path><path d="M682.9 339.7h113.8v22.8H682.9zM442.3 277.3h15.3L440 347.7l-22.8-99h-36.6l-26.5 99-19.9-99H296L334.8 408h37.4l26.2-94.2 23.4 94.2h34.5l44.5-159.3h-58.6v28.6h0.1z" fill="#446EB1"></path></g></svg>
            </div>
                <h4 className='text-capitalize mt-2 alert alert-info p-2'>select a test to continue </h4>
              </div>
            </div>
          </>
        }
      </div>
    </>
  )
}
