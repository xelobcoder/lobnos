import { AnalyticsSharp, ProductionQuantityLimits, Queue } from '@mui/icons-material'
import Link from 'next/link'
import Headers from '../../../../components/header';

export default function UltrasoundHomePage() {
  return (
    <div>
      <Headers/>
      <h1 className='text-center'>{new Date().toUTCString()}</h1>
      <h2 className='text-center text-success'>---------------Ultrasound Department-----------------</h2>
      <div className='container grid-30-30-30 mt-4' >
        <Link href={'./ultrasound/waitinglist'}>
          <button className='btn btn-primary p-5'>
            <Queue />
            <h4 className='text-capitalize'>waiting list</h4>
          </button>
        </Link>
        <Link href={'./ultrasound/processedlist'}>
          <button className='btn btn-warning p-5'>
            <ProductionQuantityLimits />
            <h4 className='text-capitalize'>Processed list</h4>
          </button>
        </Link>

        <button className='btn btn-secondary p-5'>
          <AnalyticsSharp />
          <h4 className='text-capitalize'>Analytics || charts</h4>
        </button>
      </div>
    </div>
  )
}
