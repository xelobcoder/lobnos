import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';

export default function Appointment() {
  return (
    <FrontDeskLayout>
      <embed src="http://localhost:5000/billing/result/pdf?billingid=288&&testid=10&&testname=liver_function_test" type='application/pdf'
          width="100%" height="100%" style={{ border: 50 }} allowfullscreen="" loading="lazy"></embed>
    </FrontDeskLayout>
  )
}


